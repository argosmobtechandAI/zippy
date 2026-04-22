import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/routes';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import store from './redux/store';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
