import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  requiredRole?: string | string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, requiredRole, ...rest }) => {
  const { user, isAuthenticated } = useAuth();
  const isAllowed = !requiredRole || (
    Array.isArray(requiredRole) ? requiredRole.includes(user?.type || '') : user?.type === requiredRole
  );

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated() && isAllowed ? (
          <Component {...props} />
        ) : (
          <Redirect to={isAuthenticated() ? '/home' : '/login'} />
        )
      }
    />
  );
};

export default PrivateRoute;