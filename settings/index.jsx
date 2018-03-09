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
      <Text>BG Display Color</Text>
          <ColorSelect
            settingsKey="bgDisplayColor"
            colors={[
              {color: 'orangered'},
              {color: 'red'},
              {color: 'yellow'},
              {color: 'lime'},
              {color: 'fuchsia'},
              {color: 'cornflowerblue'}
            ]}
          />
        </Section>
        <Section
        title={<Text bold align="center">Data Source Settings</Text>}>

        <TextInput
          settingsKey="settingsSourceURL"
          label="Settings API URL"
          placeholder="http://127.0.0.1:17580/status.json"
        />
        <TEXT>
          This is the URL the app will use to fetch settings like units, high and low thresholds from.<BR>
          If you are using xdrip it is likely http://127.0.0.1:17580/status.json and if you are using Nightscout it is likely https://<nightscout site FQDN>/api/v1/status.json
          </TEXT>
        <TextInput
          settingsKey="dataSourceURL"
          label="Data API URL"
          placeholder="http://127.0.0.1:17580/sgv.json"
        />
        <TEXT>
          This is the URL the app will use to fetch data points for graph and BG value display.<BR>
          If you are using xdrip it is likely http://127.0.0.1:17580/status.json and if you are using Nightscout it is likely https://<nightscout site FQDN>/api/v1/status.json
          </TEXT>
      </Section>

    </Page>
  );
}

registerSettingsPage(mySettings);
