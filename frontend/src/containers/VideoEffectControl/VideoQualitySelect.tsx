import { useVideoEffectState } from "../../providers/VideoEffectProvider/VideoEffectProvider";
import React from "react";
import { FormField, Select } from "amazon-chime-sdk-component-library-react";

export const VideoQualitySelect: React.FC<{}> = props => {
    const { VideoQualityOptions, selectQuality, videoQuality } = useVideoEffectState()
    const options = VideoQualityOptions.map(e => { return { label: e, value: e } })
  
    const handleChange = (e: any) => {
      selectQuality(e.target.value)
    };
  
    return (
      <>
        <FormField
          field={Select}
          options={options}
          onChange={handleChange}
          value={videoQuality}
          label="Video Quality"
          layout={'horizontal'}
        />     
      </>
    );
  };
  