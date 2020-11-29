import { useVideoInputs, useSelectVideoInputDevice, FormField, Select } from "amazon-chime-sdk-component-library-react";
import { useVideoEffectState, VirtualBackgroundQuality } from "../../providers/VideoEffectProvider/VideoEffectProvider";
import React from "react";

export const VirtualBackgroundQualitySelect: React.FC<{}> = props => {
    const { selectedDevice } = useVideoInputs({ additionalDevices: true });
    const selectDevice = useSelectVideoInputDevice();
    const { virtualBackgroundQuality, setVirtualBackgroundQuality, VirtualBackgroundQualityOptions} = useVideoEffectState()
    const options = VirtualBackgroundQualityOptions.map(e => { return { label: ""+e, value: ""+e } })
    const handleChange = (e: any) => {
      setVirtualBackgroundQuality(parseInt(e.target.value) as VirtualBackgroundQuality)
      console.log(e.target.value)
      if (selectDevice) {
        selectDevice(selectedDevice!)
      }
    };
  
    return (
      <>
        <FormField
          field={Select}
          options={options}
          onChange={handleChange}
          value={""+virtualBackgroundQuality}
          label="Virtual Background Quality(0: low - 4: high)"
          layout={'horizontal'}
        />     
      </>
    );
  };
  