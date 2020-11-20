import React from 'react';
import { useFeaturedTileState, useContentShareState, useRemoteVideoTileState, useLocalVideo, FeaturedRemoteVideos, RemoteVideos, LocalVideo, VideoGrid } from 'amazon-chime-sdk-component-library-react';
import CustomContentShare from './CustomContentShare';
import { Layout } from 'amazon-chime-sdk-component-library-react/lib/components/ui/VideoGrid';

export interface BaseSdkProps {
    /** Optional css */
    css?: string;
    /** Optional class names to apply to the element */
    className?: string;
}


const fluidStyles = `
  height: 100%;
  width: 100%;
`;

const staticStyles = `
  display: flex;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 20vw;
  max-height: 30vh;
  height: auto;

  video {
    position: static;
  }
`;

//interface Props extends BaseProps {
interface Props extends BaseSdkProps {
        
    /** A component to render when there are no remote videos present */
  noRemoteVideoView?: React.ReactNode;
  /** The layout of the grid. */
  layout?: Layout;
}

export const CustomVideoTileGrid: React.FC<Props> = ({
  noRemoteVideoView,
  layout = "featured",
  ...rest
}) => {
  const { tileId: featureTileId } = useFeaturedTileState();
  const { tiles } = useRemoteVideoTileState();
  const { tileId: contentTileId } = useContentShareState();
  const { isVideoEnabled } = useLocalVideo();
  const featured = layout === "featured" && (!!featureTileId || !!contentTileId);
  const remoteSize = tiles.length + (contentTileId ? 1 : 0);
  const gridSize =
    remoteSize > 1 && isVideoEnabled ? remoteSize + 1 : remoteSize;

  return (
    <VideoGrid {...rest} size={gridSize} layout={featured ? 'featured' : null}>
      <CustomContentShare css="grid-area: ft;" />
      { layout === "featured" ? <FeaturedRemoteVideos /> : <RemoteVideos/> }
      <LocalVideo
        nameplate="Me"
        css={gridSize > 1 ? fluidStyles : staticStyles}
      />
      {remoteSize === 0 && noRemoteVideoView}
    </VideoGrid>
  );
};

export default CustomVideoTileGrid;
