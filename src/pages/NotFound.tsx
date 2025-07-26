import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-brand-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page "{location.pathname}" you are looking for does not exist.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="brand">
            <Link to="/">Return to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="mailto:support@example.com">Report Issue</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
