function mySettings(props) {
  return (
    <Page>
    <Section
        title={<Text bold align="center">Watchface Theme Settings</Text>}>
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
        <Select
            label="Date Format"
            settingsKey="dateFormat"
            options={[
               {
                 name: "Day of Week, Day/Month/Year",
                 value: "DMY"
               },
               {
                 name: "Year/Month/Day - Day of Week",
                 value: "YMD"
               },
               {
                 name: "Day of Week, Month/Day/Year",
                 value: "MDY"
               }
            ]}
          />
        </Section>
        <Section
        title={<Text bold align="center">Data Source Settings</Text>}>
        <Text>
          See watch face github Wiki for URL Explanations.  
          Leave field blank to work with XDrip+ but other data sources MUST be specified.
          </Text>
        <Text>https://github.com/PedanticAvenger/FlashCGM/wiki</Text>
        <TextInput
          settingsKey="dataSourceURL"
          label="Data API URL"
          placeholder="URL to the sgv.json on your data source."
        />
      </Section>
      <Section title={<Text bold align="center">Units and Alert Preferences</Text>}>
        <Text>
          Set your preferred BG Units and Low/High levels for watch to alert you. 
          On Graph anything above your high level but below your high level plus 2mmol/L (36 mg/dL) will be yelow, above that will be red.
          Also set the custom timers for the alert buttons to snooze alarms when you go high/low, in minutes.
        </Text>
        <Select
            label="Glucose Units"
            settingsKey="bgDataUnits"
            options={[
               {
                 name: "mmol/L",
                 value: "mmol"
               },
               {
                 name: "mg/dL",
                 value: "mg/dl"
               }
            ]}
          />
          <TextInput label="High Threshold" settingsKey="bgHighLevel" />
          <TextInput label="Low Threshold" settingsKey="bgLowLevel" />
          <TextInput label="Left Button Alert Snooze Time" settingsKey="alertLeftSnooze" />
          <TextInput label="Right Button Alert Snooze Time" settingsKey="alertRightSnooze" />
      </Section>

    </Page>
  );
}

registerSettingsPage(mySettings);
