import { RouterProvider } from 'react-router-dom'
import { router } from './app/router/index.'

export default function App() {
  return <RouterProvider router={router} />
}