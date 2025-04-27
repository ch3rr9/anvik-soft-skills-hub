
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <ShieldX className="mx-auto h-20 w-20 text-destructive" />
        <h1 className="mt-6 text-3xl font-bold text-anvik-dark">Доступ запрещен</h1>
        <p className="mt-3 text-muted-foreground">
          У вас недостаточно прав для доступа к запрошенной странице.
        </p>
        <div className="mt-6 space-x-3">
          <Button onClick={() => navigate(-1)}>Вернуться назад</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
