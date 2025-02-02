import '@styles/globals.css';

export const metadata = {
  title: "GasbyGas",
  description: "Made Convenient",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className=''>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
