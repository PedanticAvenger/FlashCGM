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
                 value: {
                   dateFormat: "DMY"
                 }
               },
               {
                 name: "Year/Month/Day - Day of Week",
                 value: {
                  dateFormat: "YMD"
                 }
               },
               {
                 name: "Day of Week, Month/Day/Year",
                 value: {
                  dateFormat: "MDY"
                 }
               }
            ]}
          />
        </Section>
        <Section
        title={<Text bold align="center">Data Source Settings</Text>}>
        <Text>
          See watch face github Wiki for URL Explanations.  
          Leave both fields blank to work with XDrip+ but other data sources MUST be specified.
          </Text>
        <Text>https://github.com/PedanticAvenger/FlashCGM/wiki</Text>
          <TextInput
          placeholder="URL to the status.json on your data source."
          settingsKey="settingsSourceURL"
          label="Settings API URL"
        />
        <TextInput
          settingsKey="dataSourceURL"
          label="Data API URL"
          placeholder="URL to the sgv.json on your data source."
        />
      </Section>

    </Page>
  );
}

registerSettingsPage(mySettings);
