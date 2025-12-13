import { ArtifactCard } from "./ArtifactCard";
import { ArtifactListItem } from "./ArtifactListItem";
import { LoadMoreButton } from "./LoadMoreButton";

export function ArtifactGrid({
  artifacts,
  onViewDetails,
  onToggleFavorite,
  onShare,
  favorites,
  viewMode,
  hasMore,
  onLoadMore,
  isLoading
}) {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {artifacts.map((artifact, index) => (
          <div
            key={artifact.id}
            className="animate-fadeInUp duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ArtifactListItem
              artifact={artifact}
              onViewDetails={onViewDetails}
              onToggleFavorite={onToggleFavorite}
              onShare={onShare}
              isFavorited={favorites.has(artifact.id)}
            />
          </div>
        ))}

        {hasMore && (
          <div className="flex justify-center pt-8">
            <LoadMoreButton
              onClick={onLoadMore}
              isLoading={isLoading}
              hasMore={hasMore}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {artifacts.map((artifact, index) => (
          <div
            key={artifact.id}
            className="animate-fadeIn duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ArtifactCard
              artifact={artifact}
              onViewDetails={onViewDetails}
              onToggleFavorite={onToggleFavorite}
              onShare={onShare}
              isFavorited={favorites.has(artifact.id)}
            />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <LoadMoreButton
            onClick={onLoadMore}
            isLoading={isLoading}
            hasMore={hasMore}
          />
        </div>
      )}
    </div>
  );
}
