import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail, generateRequestStatusEmail } from '@/lib/email';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get registration ID from URL - await params
    const params = await Promise.resolve(context.params);
    const registrationId = parseInt(params.id);
    console.log('Parsed registration ID:', registrationId);
    
    if (isNaN(registrationId)) {
      return NextResponse.json(
        { error: 'Invalid registration ID format' },
        { status: 400 }
      );
    }

    // Get the current admin from session with auth options
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const admin_id = parseInt(session.user.id);
    
    let connection;
    try {
      const body = await request.json();
      const { status, registrationType, district } = body;
      console.log('Request body:', { status, registrationType, district });

      if (!['accepted', 'rejected'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be either accepted or rejected' },
          { status: 400 }
        );
      }

      if (!['outlet', 'business'].includes(registrationType)) {
        return NextResponse.json(
          { error: 'Invalid registration type. Must be either outlet or business' },
          { status: 400 }
        );
      }

      // Only require district if accepting an outlet registration
      if (registrationType === 'outlet' && status === 'accepted') {
        if (!district || district.trim() === '') {
          console.error('District is required for accepting outlet registration');
          return NextResponse.json(
            { error: 'District is required for accepting outlet registration' },
            { status: 400 }
          );
        }

        // Validate district format (first letter capitalized, rest lowercase)
        const formattedDistrict = district.trim().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
        
        // List of valid districts in Sri Lanka
        const validDistricts = [
          'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
          'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
          'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
          'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
          'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
        ];

        if (!validDistricts.includes(formattedDistrict)) {
          return NextResponse.json(
            { error: `Invalid district. Must be one of: ${validDistricts.join(', ')}` },
            { status: 400 }
          );
        }

        // Use the formatted district name
        body.district = formattedDistrict;
      }

      connection = await pool.getConnection();
      console.log('Database connection established');

      try {
        await connection.beginTransaction();
        console.log('Transaction started');

        // First verify admin exists and is active
        const [admins] = await connection.execute(
          'SELECT admin_id, status FROM head_office_admin WHERE admin_id = ? AND status = ?',
          [admin_id, 'active']
        );

        if (!(admins as any[]).length) {
          throw new Error('Your admin account is not active. Please contact the super admin.');
        }

        if (registrationType === 'outlet') {
          console.log('Processing outlet verification');
          
          // First get the outlet manager details
          const [managers] = await connection.execute(
            `SELECT * FROM outlet_manager WHERE manager_id = ? AND verification_status = 'pending'`,
            [registrationId]
          );

          if (!(managers as any[]).length) {
            throw new Error(`Outlet manager not found or already verified: ${registrationId}`);
          }

          const manager = (managers as any[])[0];

          // Update outlet_manager verification status
          await connection.execute(
            'UPDATE outlet_manager SET verification_status = ?, verification_date = NOW(), verified_by = ? WHERE manager_id = ?',
            [status, admin_id, registrationId]
          );

          // If accepted, create a new outlet record
          if (status === 'accepted') {
            console.log('Creating new outlet record');
            await connection.execute(
              `INSERT INTO outlet (manager_id, outlet_name, district, status) 
               VALUES (?, ?, ?, 'active')`,
              [registrationId, manager.outlet_name, body.district]
            );

            // Initialize outlet stock records for each cylinder type
            const [cylinderTypes] = await connection.execute('SELECT type_id FROM cylinder_types');
            const [outletResult] = await connection.execute('SELECT LAST_INSERT_ID() as outlet_id');
            const outletId = (outletResult as any[])[0].outlet_id;

            for (const type of cylinderTypes as any[]) {
              await connection.execute(
                `INSERT INTO outlet_stock (outlet_id, cylinder_type_id, quantity, last_updated)
                 VALUES (?, ?, 0, NOW())`,
                [outletId, type.type_id]
              );
            }
          }

          // Send email notification to outlet manager
          try {
            await sendEmail({
              to: manager.email,
              subject: `Outlet Registration ${status === 'accepted' ? 'Approved' : 'Rejected'}`,
              html: generateRequestStatusEmail('outlet', status === 'accepted' ? 'approved' : 'rejected', manager.manager_name)
            });
            console.log('Sent email notification to outlet manager:', manager.email);
          } catch (emailError) {
            console.error('Error sending email to outlet manager:', emailError);
            // Don't throw error here, continue with the process
          }

        } else {
          console.log('Processing business verification');
          
          // First check if business exists and is pending
          const [businesses] = await connection.execute(
            `SELECT bc.*, c.* 
             FROM business_consumer bc
             JOIN consumer c ON bc.business_consumer_id = c.consumer_id
             WHERE bc.business_consumer_id = ? 
             AND bc.verification_status = 'pending'`,
            [registrationId]
          );
          console.log('Business check result:', businesses[0]);

          if (!(businesses as any[]).length) {
            throw new Error(`Business registration not found or already verified: ${registrationId}`);
          }

          const business = (businesses as any[])[0];

          // Update business_consumer verification status
          await connection.execute(
            'UPDATE business_consumer SET verification_status = ?, verification_date = NOW(), verified_by = ? WHERE business_consumer_id = ?',
            [status, admin_id, registrationId]
          );

          // Update consumer status if rejected
          if (status === 'rejected') {
            await connection.execute(
              'UPDATE consumer SET status = ? WHERE consumer_id = ?',
              ['inactive', registrationId]
            );
          }

          // Send email notification to business owner
          try {
            await sendEmail({
              to: business.email,
              subject: `Business Registration ${status === 'accepted' ? 'Approved' : 'Rejected'}`,
              html: generateRequestStatusEmail('business', status === 'accepted' ? 'approved' : 'rejected', business.name)
            });
            console.log('Sent email notification to business owner:', business.email);
          } catch (emailError) {
            console.error('Error sending email to business owner:', emailError);
            // Don't throw error here, continue with the process
          }
        }

        await connection.commit();
        console.log('Transaction committed');

        return NextResponse.json({ message: 'Verification status updated successfully' });
      } catch (error) {
        console.error('Error in transaction:', error);
        await connection.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error in verification API:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to update verification status' },
        { status: 500 }
      );
    } finally {
      if (connection) {
        connection.release();
      }
    }
  } catch (error) {
    console.error('Error in verification API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update verification status' },
      { status: 500 }
    );
  }
}
