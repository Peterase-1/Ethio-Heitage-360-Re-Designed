import { useState } from "react";
import {
  X,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Calendar,
  Ruler,
  Info,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export function ArtifactDetailsModal({
  artifact,
  isOpen,
  onClose,
  onToggleFavorite,
  onShare,
  isFavorited,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSignificanceExpanded, setIsSignificanceExpanded] = useState(false);

  const DESCRIPTION_LIMIT = 200;
  const SIGNIFICANCE_LIMIT = 150;

  const nextImage = () => {
    if (artifact.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % artifact.images.length);
    }
  };

  const prevImage = () => {
    if (artifact.images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + artifact.images.length) % artifact.images.length
      );
    }
  };

  const getConditionColor = (condition) => {
    switch (condition.toLowerCase()) {
      case "excellent":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "fair":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "weathered":
        return "bg-stone-100 text-stone-800 border-stone-200";
      default:
        return "bg-stone-100 text-stone-800 border-stone-200";
    }
  };

  const handleAudioPlayPause = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const getTruncatedText = (text, limit) => {
    if (text.length <= limit) {
      return { text, needsTruncation: false };
    }
    const truncated = text.substring(0, limit);
    const lastSpace = truncated.lastIndexOf(" ");
    return {
      text:
        lastSpace > 0
          ? truncated.substring(0, lastSpace) + "..."
          : truncated + "...",
      needsTruncation: true,
    };
  };

  const description = artifact.longDescription || artifact.description;
  const significance = artifact.significance;

  const truncatedDescription = getTruncatedText(description, DESCRIPTION_LIMIT);
  const truncatedSignificance = getTruncatedText(
    significance,
    SIGNIFICANCE_LIMIT
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] p-0 bg-white sm:max-w-6xl sm:h-[90vh] sm:max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">{artifact.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Detailed view of {artifact.title}, a {artifact.category} artifact from{" "}
          {artifact.culture} culture, dating to {artifact.period}.
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200 bg-white shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-lg sm:text-2xl font-medium text-stone-800 truncate">
              {artifact.title}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm sm:text-base">
              <span className="text-stone-600">{artifact.culture}</span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-600">{artifact.period}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className={`hidden sm:flex transition-all duration-200 ${
                isFavorited
                  ? "text-red-500 border-red-200 hover:bg-red-50"
                  : "text-stone-600"
              }`}
              onClick={() => onToggleFavorite(artifact.id)}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`}
              />
              {isFavorited ? "Favorited" : "Add to Favorites"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`sm:hidden transition-all duration-200 ${
                isFavorited
                  ? "text-red-500 border-red-200 hover:bg-red-50"
                  : "text-stone-600"
              }`}
              onClick={() => onToggleFavorite(artifact.id)}
            >
              <Heart
                className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`}
              />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex text-stone-600"
              onClick={() => onShare(artifact)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="sm:hidden text-stone-600"
              onClick={() => onShare(artifact)}
            >
              <Share2 className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-stone-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Image Section */}
            <div className="relative bg-stone-100 flex items-center justify-center h-64 sm:h-80 lg:h-full lg:w-1/2 shrink-0">
              {artifact.images && artifact.images.length > 0 && (
                <>
                  <ImageWithFallback
                    src={artifact.images[currentImageIndex]}
                    alt={artifact.title}
                    className="w-full h-full object-contain"
                  />

                  {artifact.images.length > 1 && (
                    <>
                      <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white border-0 shadow-md"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white border-0 shadow-md"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>

                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {artifact.images.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentImageIndex
                                ? "bg-white w-6"
                                : "bg-white/50"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {artifact.featured && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-emerald-600 text-white border-0 shadow-md text-xs">
                    Featured Artifact
                  </Badge>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="flex-1 lg:w-1/2 bg-white min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 sm:p-6 pb-8">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger
                        value="overview"
                        className="text-xs sm:text-sm"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="details"
                        className="text-xs sm:text-sm"
                      >
                        Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="context"
                        className="text-xs sm:text-sm"
                      >
                        Context
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-0">
                      {/* Description with Load More */}
                      <div>
                        <h3 className="text-base sm:text-lg font-medium text-stone-800 mb-3">
                          Description
                        </h3>
                        <div className="space-y-3">
                          <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
                            {isDescriptionExpanded
                              ? description
                              : truncatedDescription.text}
                          </p>

                          {truncatedDescription.needsTruncation && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 p-0 h-auto font-medium text-sm"
                              onClick={() =>
                                setIsDescriptionExpanded(!isDescriptionExpanded)
                              }
                            >
                              {isDescriptionExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Read More
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 text-stone-600 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium text-sm">
                                Location
                              </span>
                            </div>
                            <p className="text-stone-800 text-sm">
                              {artifact.region}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 text-stone-600 mb-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium text-sm">
                                Period
                              </span>
                            </div>
                            <p className="text-stone-800 text-sm">
                              {artifact.period}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Audio Guide */}
                      {artifact.audioGuide && (
                        <Card>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-stone-800 text-sm">
                                Audio Guide
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                3:45
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full text-sm"
                              size="sm"
                              onClick={handleAudioPlayPause}
                            >
                              {isPlayingAudio ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause Audio Guide
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Play Audio Guide
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {/* Tags */}
                      <div>
                        <h4 className="font-medium text-stone-800 mb-3 text-sm sm:text-base">
                          Related Topics
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {artifact.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6 mt-0">
                      {/* Physical Details */}
                      <div className="space-y-4">
                        <h3 className="text-base sm:text-lg font-medium text-stone-800">
                          Physical Details
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center justify-between py-2 border-b border-stone-100">
                            <span className="text-stone-600 text-sm">
                              Materials
                            </span>
                            <span className="font-medium text-stone-800 text-sm text-right">
                              {artifact.materials.join(", ")}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2 border-b border-stone-100">
                            <span className="text-stone-600 text-sm">
                              Dimensions
                            </span>
                            <span className="font-medium text-stone-800 text-sm text-right">
                              {artifact.dimensions}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2 border-b border-stone-100">
                            <span className="text-stone-600 text-sm">
                              Condition
                            </span>
                            <Badge
                              className={`${getConditionColor(
                                artifact.condition
                              )} border text-xs`}
                            >
                              {artifact.condition}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between py-2 border-b border-stone-100">
                            <span className="text-stone-600 text-sm">
                              Category
                            </span>
                            <span className="font-medium text-stone-800 text-sm text-right">
                              {artifact.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Discovery Info */}
                      {artifact.dateDiscovered && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-stone-800 text-sm sm:text-base">
                            Discovery Information
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between py-2 border-b border-stone-100">
                              <span className="text-stone-600 text-sm">
                                Date Discovered
                              </span>
                              <span className="font-medium text-stone-800 text-sm text-right">
                                {artifact.dateDiscovered}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-stone-100">
                              <span className="text-stone-600 text-sm">
                                Current Location
                              </span>
                              <span className="font-medium text-stone-800 text-sm text-right">
                                {artifact.currentLocation}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="context" className="space-y-6 mt-0">
                      {/* Historical Significance with Load More */}
                      <div>
                        <h3 className="text-base sm:text-lg font-medium text-stone-800 mb-3">
                          Historical Significance
                        </h3>
                        <div className="space-y-3">
                          <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
                            {isSignificanceExpanded
                              ? significance
                              : truncatedSignificance.text}
                          </p>

                          {truncatedSignificance.needsTruncation && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 p-0 h-auto font-medium text-sm"
                              onClick={() =>
                                setIsSignificanceExpanded(
                                  !isSignificanceExpanded
                                )
                              }
                            >
                              {isSignificanceExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Read More
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Cultural Context */}
                      <div>
                        <h4 className="font-medium text-stone-800 mb-3 text-sm sm:text-base">
                          Cultural Context
                        </h4>
                        <Card>
                          <CardContent className="p-3 sm:p-4 bg-amber-50 border-amber-200">
                            <p className="text-stone-700 text-sm leading-relaxed">
                              This artifact represents the rich cultural
                              heritage of {artifact.culture} civilization during
                              the {artifact.period}. It showcases the
                              sophisticated craftsmanship and artistic
                              traditions that flourished in the{" "}
                              {artifact.region} region.
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Related Artifacts */}
                      {artifact.relatedArtifacts.length > 0 && (
                        <div>
                          <h4 className="font-medium text-stone-800 mb-3 text-sm sm:text-base">
                            Related Artifacts
                          </h4>
                          <div className="text-sm text-stone-600">
                            <p className="text-sm">
                              Explore similar artifacts from this culture and
                              time period.
                            </p>
                            <Button
                              variant="outline"
                              className="mt-2"
                              size="sm"
                            >
                              View Related Items
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Extra spacing at bottom to ensure all content is scrollable */}
                      <div className="h-8"></div>
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}