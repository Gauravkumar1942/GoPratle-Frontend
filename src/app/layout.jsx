import './globals.css';

export const metadata = {
  title: 'GoPratle – Post Event Requirement',
  description: 'Post tailored requirements for Event Planners, Performers, and Crew on GoPratle.',
  icons: {
    icon: 'https://res.cloudinary.com/de6aivvo3/image/upload/v1748882547/Logo_1_qy4auw.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FBFBFB] text-slate-800">
        {children}
      </body>
    </html>
  );
}
