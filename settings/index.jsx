import { settings } from "settings";
import { XMLHttpRequest } from "xmlhttprequest";

function mySettings(props) {
  return (
    <Page>
      <Text>
        FlashCGM allows you to view Continuous Glucose Values from various sources along with the usual set of Fitbit health info. 
      </Text>
      <Text>         
        <Link source="https://github.com/PedanticAvenger/FlashCGM/wiki">Click here for setup info for FlashCGM!</Link>
      </Text>
      <Section title={<Text bold align="center">Watchface Color Settings</Text>}>
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
      <Section title={<Text bold align="center">Watch Date/Time Settings</Text>}>
        <Select label={`Time Format`} settingsKey="timeFormat" options={[ {name:"12hr", value:false}, {name:"24hr", value:true} ]} />
        <Select label={`Date Format`} settingsKey="dateFormat" options={[ {name:"YYYY/MM/DD", value:"YYYY/MM/DD"}, {name:"DD/MM/YYYY", value:"DD/MM/YYYY"}, {name:"MM/DD/YYYY", value:"MM/DD/YYYY"} ]} />
      </Section>
      <Section title={<Text bold align="center">Data Source Settings</Text>}>
        <Select label={`Data Source`} settingsKey="dataSource" options={[ {name:"Dexcom", value:"dexcom"}, {name:"Nightscout", value:"nightscout"}, {name:"xDrip+", value:"xdrip"}, {name:"Spike", value:"spike"}, {name:"Tomato", value:"tomato"}, {name:"Custom", value:"custom"}, ]} />

        {((props.settings.dataSource) ? ((JSON.parse(props.settings.dataSource).values[0].value == 'custom') ?
        <TextInput label="Api endpoint" settingsKey="customEndpoint" /> : null) : null)}
        
        {((props.settings.dataSource) ? ((JSON.parse(props.settings.dataSource).values[0].value == 'nightscout') ?
          <Text text="center">https://<Text bold>SiteName</Text>.NightscoutHostSite.com</Text> : null) : null)}
        
        {((props.settings.dataSource) ? ((JSON.parse(props.settings.dataSource).values[0].value == 'nightscout') ?
        <TextInput title="Nightscout" label="Site Name" settingsKey="nightscoutSiteName" /> : null) : null)}
          
        {((props.settings.dataSource) ? ((JSON.parse(props.settings.dataSource).values[0].value == 'nightscout') ?
          <Text text="center">https://SiteName.<Text bold>NightscoutHostDomain</Text>.com</Text> : null) : null)}
        {((props.settings.dataSource) ? ((JSON.parse(props.settings.dataSource).values[0].value == 'nightscout') ? <Select label="Nightscout Host Domain" settingsKey="nightscoutSiteHost" options={[{name:"Heroku", value:"herokuapp.com"},{name:"Azure", value:"azurewebsites.net"}]} /> : null) : null)}
        
        {((props.settings.dataSource) ? ((JSON.parse(props.settings.dataSource).values[0].value == 'dexcom') ? 
        <Section title={<Text bold align="center">Dexcom</Text>}>
          <Text bold align="center">Dexcom</Text>                                        
          <TextInput title="Username" label="Username" settingsKey="dexcomUsername" />
          <TextInput title="Password" label="Password" settingsKey="dexcomPassword" />
          <Toggle settingsKey="USAVSInternational" label="International (Not in USA)"/>            
          </Section> : null) : null)} 
    </Section>      
      <Section title={<Text bold align="center">Glucose Settings</Text>}>
        <Select label={`Glucose Units`} settingsKey="glucoseUnits" options={[ {name:"mgdl", value:"mgdl"}, {name:"mmol", value:"mmol"} ]} />
        <TextInput label="High Threshold" settingsKey="highThreshold" />
        <TextInput label="Low Threshold" settingsKey="lowThreshold" />
        <Toggle settingsKey="disableAlert" label="Disable Alerts" />
        <Toggle settingsKey="extraGlucoseSettings" label="Extra Glucose Settings"/>
      
        {((props.settings.extraGlucoseSettings) ? ((JSON.parse(props.settings.extraGlucoseSettings) == true) ? 
        <Section title={<Text bold align="center">Extra Glucose Settings</Text>}>
            <Text bold align="center">Alerts</Text>
            <Toggle settingsKey="highAlerts" label="High Alerts"/> 
            <TextInput label="Dismiss high alerts for n minutes" settingsKey="dismissHighFor" /> 
            <Toggle settingsKey="lowAlerts" label="Low Alerts"/>
            <TextInput label="Dismiss low alerts for n minutes" settingsKey="dismissLowFor" />
            <Toggle settingsKey="rapidRise" label="Rapid Rise Alerts"/>
            <Toggle settingsKey="rapidFall" label="Rapid Fall Alerts"/>
            {((props.settings.dataSource) ? ((JSON.parse(props.settings.dataSource).values[0].value == 'nightscout') ? <Toggle settingsKey="loopstatus" label="Loop Status Alerts"/> : null) : null)}                                     
            <Toggle settingsKey="staleData" label="Stale Data Alerts"/>
            <TextInput label="Stale data alerts after n minutes" settingsKey="staleDataAlertAfter" />
            <Toggle settingsKey="resetAlertDismissal" label="Dismiss alarm when back in range"/>                               
      </Section> : null) : null)} 
      </Section>  
    </Page>
  );
}

registerSettingsPage(mySettings);
