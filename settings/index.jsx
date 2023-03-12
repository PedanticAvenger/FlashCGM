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
          See Wiki on github Setting Explanations.
          Leaving this field blank will work with direct to local XDrip+ but all other data sources MUST be specified.
        </Text>
        <Text>https://github.com/PedanticAvenger/FlashCGM/wiki</Text>
        <Toggle
          settingsKey="nsToggle"
          label="Set Nightscout as datasource?"
        />
        <Select
          label="Data Source Type"
          settingsKey="dataSource"
          disabled={(props.settings.nightscoutToggle === "true")}
          options={[
            {
              name: "XDrip+ (Android)",
              value: "xdrip"
            },
            {
              name: "Spike (iOS)",
              value: "spike"
            }
          ]}
        />
        <TextInput
          title="FQDN of your nightscout site."
          settingsKey="dataSourceURL"
          label="NightScout Site URL"
          placeholder="https://your.nightscout.site"
          disabled={!(props.settings.nightscoutToggle === "true")}
        />
        <TextInput
          title="Enter the full token you have added to nightscout for fitbit read access."
          settingsKey="dataToken"
          label="NightScout Site Token setup for your fitbit"
          placeholder="Token"
          disabled={!(props.settings.nightscoutToggle === "true")}
        />
      </Section>
      <Section title={<Text bold align="center">Units and Alert Preferences</Text>}>
        <Text>
          Set your preferred BG Units and Low/High levels for watch to alert you.
        </Text>
        <Text>
          For Snooze Time, set the number of MINUTES you would like the "Left" and "Right" snooze button intervals to be.
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
