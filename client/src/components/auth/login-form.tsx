import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (user: any) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Demo login - accept admin@rad.test with any password
      if (email === "admin@rad.test") {
        const user = {
          id: "u1",
          name: "Admin RAD", 
          email: "admin@rad.test",
          role: "admin"
        };
        
        store.setCurrentUser(user);
        onLogin(user);
        
        toast({
          title: "Login Successful",
          description: "Welcome to RAD Ad Display Platform",
          variant: "default"
        });
      } else {
        toast({
          title: "Login Failed", 
          description: "Use admin@rad.test with any password for demo",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rad-grey-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-rad-blue rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <CardTitle className="text-2xl font-bold text-rad-grey-800">Welcome to RAD</CardTitle>
          <CardDescription>
            Sign in to access the Ad Display Platform
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@rad.test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter any password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-rad-blue hover:bg-rad-blue/90" 
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Login:</strong><br />
              Email: admin@rad.test<br />
              Password: (any password)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
