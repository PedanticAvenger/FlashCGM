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

        <Toggle
          settingsKey="unitsType"
          label="[ mmol/l ] Or [ mg/dl ]"
        />
        <TextInput
          settingsKey="dataSourceURL"
          label="REST api url"
          placeholder="http://127.0.0.1:17580/sgv.json"
        />

      </Section>

    </Page>
  );
}

registerSettingsPage(mySettings);
