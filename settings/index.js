function FlexTimeSettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">FlexTime Clock Settings</Text>}>   
    
        <TextInput
        label="Day Start Time"
        placeholder="ex: 10h30"
        settingsKey="startTime"
        />

        <TextInput
        label="Day End Time"
        placeholder="ex: 22h15"
        settingsKey="endTime"/>
    
        <Toggle
        label="Hide clock"
        settingsKey="hideClock"/>
    
        <Toggle
        settingsKey="hideTimeLeft"
        label="Hide remaining time"/>
    
        <Toggle
        label="Disable tap for toggle"
        settingsKey="toggleOff"/>
    
        <Toggle
        label="Hide percentage"
        settingsKey="hidePercentage"/>
    
     <Toggle
        label="Hide date"
        settingsKey="hideDate"/>
      </Section>
    </Page>
  );
}

registerSettingsPage(FlexTimeSettings);