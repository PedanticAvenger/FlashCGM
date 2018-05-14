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
        </Section>
        <Section
        title={<Text bold align="center">Data Source Settings</Text>}>
        <Text>
          See watch face github Wiki for URL Explanations.
          </Text>
        <Text>https://github.com/PedanticAvenger/FlashCGM/wiki</Text>
          <TextInput
          defaultValue="http://127.0.0.1:17580/status.json"
          settingsKey="settingsSourceURL"
          label="Settings API URL"
        />
        <TextInput
          settingsKey="dataSourceURL"
          label="Data API URL"
          defaultValue="http://127.0.0.1:17580/sgv.json?count=24"
        />
      </Section>

    </Page>
  );
}

registerSettingsPage(mySettings);
