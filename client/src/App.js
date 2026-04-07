import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './components/Login';
import Signup from './components/Signup';
import Layout from './components/Layout';
import Main from './components/Home';
import Unauthorized from './components/Unauthorized';
import TopicsPage from './pages/Topics';
import NotesPage from './pages/Notes';
import PublicTopics from './pages/PublicTopics';
import PublicTopicPage from './pages/PublicTopicPage';
import Saved from './pages/Saved';
import Liked from './pages/Liked';
import Calendar from './pages/Calendar';

function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('token');
  return isLoggedIn ? children : <Navigate to='/login' />;
}

function App() {
  return (
    <Routes>
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path='/' element={<Main />} />
        <Route path="/subjects/:id/topics" element={<TopicsPage />} />
        <Route path="/topics/:id/notes" element={<NotesPage />} />
        <Route path="/public/topics" element={<PublicTopics />} />
        <Route path="/public/topics/:topicId" element={<PublicTopicPage />} />
        <Route path="/saved" element={<Saved /> } />
        <Route path="/liked" element={<Liked />} />
        <Route path="/calendar" element={<Calendar />} />
      </Route>
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/unauthorized' element={<Unauthorized />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default App;
