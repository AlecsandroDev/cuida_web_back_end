import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface HealthCampaignCardProps {
  title: string;
  description: string;
  content: string;
  source: string;
  link?: string;
  image: string;
  variant?: "pink" | "blue" | "default";
}

const HealthCampaignCard = ({
  title,
  description,
  content,
  source,
  link,
  image,
  variant = "default",
}: HealthCampaignCardProps) => {
  const variantStyles = {
    pink: "border-l-4 border-l-pink-500 hover:shadow-lg",
    blue: "border-l-4 border-l-blue-500 hover:shadow-lg",
    default: "border-l-4 border-l-primary hover:shadow-lg",
  };

  return (
    <Card className={`group overflow-hidden transition-all duration-300 ${variantStyles[variant]} hover:-translate-y-1`}>
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          por {source}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/80 line-clamp-3">{description}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">{content}</p>

         {link && link !== "#" && (
        <Button asChild variant="outline" className="w-full group/btn">
          <a href={link} target="_blank" rel="noopener noreferrer">
            Continue a ler
            <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </a>
        </Button>
         )}
      </CardContent>
    </Card>
  );
};

export default HealthCampaignCard;