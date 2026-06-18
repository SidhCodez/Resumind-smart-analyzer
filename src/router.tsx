import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '~/routes/RootLayout';
import Home from '~/routes/Home';
import Auth from '~/routes/Auth';
import Upload from '~/routes/Upload';
import ResumeDetail from '~/routes/ResumeDetail';
import Wipe from '~/routes/Wipe';
import NotFound from '~/routes/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'auth', element: <Auth /> },
      { path: 'upload', element: <Upload /> },
      { path: 'resume/:id', element: <ResumeDetail /> },
      { path: 'wipe', element: <Wipe /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
