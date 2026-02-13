import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import StockInList from './pages/StockInList';
import StockOutList from './pages/StockOutList';
import SparePartsList from './pages/SparePartsList';
import AddCategory from './pages/AddCategory';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/stock-in" component={StockInList} />
        <Route path="/stock-out" component={StockOutList} />
        <Route path="/spare-parts" component={SparePartsList} />
        <Route path="/add-category" component={AddCategory} />
        <Route path="/" exact>
          <h1>Welcome to the Inventory Management System</h1>
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
