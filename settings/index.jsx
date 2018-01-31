function mySettings(props) {
  return (
    <Page>
    <Section
        title={<Text bold align="center">Watchface Settings</Text>}>
      <Select
            label="Theme"
            settingsKey="theme"
            options={[
               {
                 name: "White",
                 value: {
                   background: "#f8fcf8",
                   foreground: "#707070"
                 }
               },
               {
                 name: "Indigo",
                 value: {
                   background: "#918adc",
                   foreground: "#625ca4"
                 }
               },
               {
                 name: "Orange",
                 value: {
                   background: "#ff9d00",
                   foreground: "#664000"
                 }
               },
               {
                 name: "Violet",
                 value: {
                   background: "#b400ff",
                   foreground: "#800099"
                 }
               },
               {
                 name: "Cyan",
                 value: {
                   background: "#009999",
                   foreground: "#005555"
                 }
               },
               {
                 name: "Gold",
                 value: {
                   background: "#776600",
                   foreground: "#554400"
                 }
               }]
            }
          />
      /* How about another theme setting for the BG data on the main viewscreen, alternatively we could define that color set for each of the above themes.
      Good point for discussion about which would be best.*/
        </Section>
        <Section
        title={<Text bold align="center">Data Source Settings</Text>}>
        
        <Toggle
          settingsKey="dataType"
          label="[ mmol/l ] Or [ mg/dl ]"
        />
        <TextInput
          settingsKey="url"
          label="REST api url"
          placeholder="http://127.0.0.1:17580/sgv.json"
          settingsKey="restURL"
        />
 
      </Section>

    </Page>
  );
}

registerSettingsPage(mySettings);
