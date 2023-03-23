import React from "react";
import { useState, useEffect } from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";



//Explore more Monday React Components here: https://style.monday.com/
import { Dropdown, Button, AttentionBox } from "monday-ui-react-core";
import { ThumbsUp, Alert } from "monday-ui-react-core/icons";

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();
const Popup = (props) => {  
  function mockOnClose() {
    props.hideMessage();
  };

  let iconType = Alert;
  if (props.popupIcon === "ThumbsUp")
    iconType = ThumbsUp;
  return (
    props.showMessage &&
      <AttentionBox
        className="monday-storybook-attention-box_box"
        text={props.message}
        title={props.title}
        type={props.popupType}
        onClose={mockOnClose}
        icon={iconType}
      />
  );
}

const App = () => {
  const [allOptionsAttorneys, setAttorneysOptions] = useState([]);
  const [allOptionsParalegals, setParalegalsOptions] = useState([]);
  const [selectedAttorney, setSelectedAttorney] = useState("");
  const [selectedParalegal, setSelectedParalegal] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupIcon, setPopupIcon] = useState();
  const [popupType, setPopupType] = useState();
  const [showMessage, setShowMessage] = useState(false);

  
  
  useEffect(() => {
    // Notice this method notifies the monday platform that user gains a first value in an app.
    // Read more about it here: https://developer.monday.com/apps/docs/mondayexecute#value-created-for-user/
    //monday.execute("valueCreatedForUser");

    // TODO: set up event listeners, Here`s an example, read more here: https://developer.monday.com/apps/docs/mondaylisten/
    monday.listen("context", (res) => {
      if (res.data && res.data.itemIds && res.data.itemIds.length > 0){
        setSelectedItemId(res.data.itemIds[0]);
        console.log(res.data.itemIds[0]);
      }
      else if (res.data && res.data.itemId){
        setSelectedItemId(res.data.itemId);
        console.log(res.data.itemId);
      }      
      else
        console.log(res.data);
    });
  }, []);

  function createSubtasks(){
    if (selectedAttorney && selectedParalegal && selectedItemId){
      const url = 'https://hooks.zapier.com/hooks/catch/3411101/3bi5klk/';
      const data = {
        selectedAttorney: selectedAttorney,
        selectedParalegal: selectedParalegal,
        selectedItemId: selectedItemId
      };
      console.log("Sending ->" + JSON.stringify(data));
      
      (async () => {
        try {
            const response = await fetch(url, {
              method: "POST",
              body: JSON.stringify(data)
            });
            const body = await response.text();
            console.log(body);
            setPopupTitle("Create Subtasks");
            setPopupMessage("Finished creating subtasks!");
            setPopupIcon("ThumbsUp");
            setPopupType(AttentionBox.types.SUCCESS);
            setShowMessage(true);
        } catch (error) {
            console.error(error);
            setPopupTitle("Create Subtasks");
            setPopupMessage("Error creating subtasks. " + error.message);
            setPopupIcon("Alert");
            setPopupType(AttentionBox.types.DANGER);
            setShowMessage(true);
        }
      })();      
    }
    else {
      setPopupTitle("Create Subtasks");
      setPopupMessage("Please select valid options.");
      setPopupIcon("Alert");
      setPopupType(AttentionBox.types.DANGER);
      setShowMessage(true);
    }
  }

  function attorneyChanged(item){
    setSelectedAttorney(item.value);
  }

  function paralegalChanged(item){
    setSelectedParalegal(item.value);
  }

  function hideMessage(){
    setShowMessage(false);
  }

  monday.api(`
  query {
    teams {
        name,
        users {
            id,
            name
        }
    }
}
  `).then(res => {
    let newOptionsAttorneys = [];
    let newOptionsParalegals = [];
    for (let team of res.data.teams){
      if (team.name.toString().trim().toLowerCase() === "attorneys"){
        for (let user of team.users){
          newOptionsAttorneys.push({value: user.id, label: user.name});
        }
      }
      else if (team.name.toString().trim().toLowerCase() === "paralegals"){
        for (let user of team.users){
          newOptionsParalegals.push({value: user.id, label: user.name});
        }
      }
    }
    setAttorneysOptions(newOptionsAttorneys);
    setParalegalsOptions(newOptionsParalegals);
  });

  return (
    <div className="App">
      <div>
        <Dropdown onChange={attorneyChanged} placeholder="Please Select an Attorney" options={allOptionsAttorneys} className="dropdown-select-member" />
      </div>
      <div>
        <Dropdown onChange={paralegalChanged} placeholder="Please Select a Paralegal" options={allOptionsParalegals} className="dropdown-select-member" />
      </div>      
      <div>
        <Button className="create-subtasks" onClick={createSubtasks}>Generate Tasks</Button>
      </div>
      <Popup title={popupTitle} message={popupMessage} popupType={popupType} popupIcon={popupIcon} showMessage={showMessage} hideMessage={hideMessage}></Popup>
    </div>
  );
};

export default App;
