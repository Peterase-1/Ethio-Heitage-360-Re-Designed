import { Eye, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function ArtifactCard({ title, region, category, description, imageUrl, onViewMore }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-amber-200 hover:border-amber-400 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg text-amber-900 leading-tight group-hover:text-amber-700 transition-colors">
              {title}
            </h3>
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
              {category}
            </Badge>
          </div>

          <div className="flex items-center gap-1 text-amber-700">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{region}</span>
          </div>

          <p className="text-sm text-amber-800 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={onViewMore}
          className="w-full border-amber-300 text-amber-800 hover:bg-amber-50 hover:border-amber-400 group"
        >
          <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          View More
        </Button>
      </CardFooter>
    </Card>
  );
}
