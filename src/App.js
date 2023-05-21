
import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import {
  Button,
  Card,
  Dimmer,
  Input,
  Label,
  Loader,
  Dropdown,
  Header,
  Form,
  Image,
} from 'semantic-ui-react';
import stateOptions from './options';

function App() {
  const [images, setImages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [editIndex, setEditIndex] = useState(-1);
  const [editedText, setEditedText] = useState('');
  const [state, setState] = useState('CA');
  const [isAppleMaps, setIsAppleMaps] = useState(true);
  const [manualAddress, setManualAddress] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTotal(images.length);
  }, [images]);

  const handleInputChange = () => {
    const { files } = fileInputRef.current;
    setImages((prevImages) => [...prevImages, ...Array.from(files)]);
  };

  const updateItem = (index, value) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = value;
      return updatedItems;
    });
  };

  const deleteItem = (index) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems.splice(index, 1);
      return updatedItems;
    });
  };

  const startEdit = (index, value) => {
    setEditIndex(index);
    setEditedText(value);
  };

  const cancelEdit = () => {
    setEditIndex(-1);
    setEditedText('');
  };

  const saveEdit = (index) => {
    updateItem(index, editedText);
    setEditIndex(-1);
    setEditedText('');
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('cardIndex', index);
  };

  const handleDrop = (e, newIndex) => {
    const cardIndex = e.dataTransfer.getData('cardIndex');
    const updatedItems = [...items];
    const [draggedItem] = updatedItems.splice(cardIndex, 1);
    updatedItems.splice(newIndex, 0, draggedItem);
    setItems(updatedItems);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const regexPattern =
    /(([1-9][0-9]{2,6}[\ \w+\.]+(\n){1,2}([\w+\ ]+\#[0-9]+\n)[A-Z\ ]+)|([1-9][0-9]{1,6}[A-Za-z ]+\n{1,}[A-Z]{2,20}(\ [A-Z]{2,20})?)|([1-9][0-9]{2,6}[\ \w+\.]+\n{1,}([A-Z 0-9]+\n)[A-Z]{2,20}(\ [A-Z]{2,20})?)|([1-9][0-9]{2,6}[\ \w+\.\-]+(\n)*([\w+\ \#\&]+\n{1,2})[A-Z]{2,20}(\ [A-Z]{2,20})?)|([1-9]{1,6}(\ )?[A-Za-z][\ \w+\.]+\n{1,}[A-Z]{2,20}([\ A-Z]{2,20})?)|([1-9][0-9]{2,6} [\ \w+\.]+\n{1,}[A-Z]{2,20}([\ A-Z]{2,20})?))/gm;

  const regex = new RegExp(regexPattern);

  const performOCR = async () => {
    setIsLoading(true);
    const itemsSet = new Set(items);

    for (let i = 0; i < images.length; i++) {
      setProgress(i + 1);
      const result = await Tesseract.recognize(images[i], 'eng');
      const { text } = result.data;

      const matches = text.match(regex);
      if (matches) {
        matches.forEach((str) => {
          const fixedMatch = str
            .toLowerCase()
            .replace(/\n/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .replace(/$/, `, ${state}`);

          itemsSet.add(fixedMatch);
        });
      }
    }

    const itemsArray = Array.from(itemsSet);
    setItems(itemsArray);
    setProgress(0);
    setIsLoading(false);
    setImages([]);
  };

  const generateDrivingDirectionLink = () => {
    const itemsToPass = items.slice(0, isAppleMaps ? 14 : 10);
    const encodedOrigin = encodeURIComponent('Current location');
    const encodedStops = itemsToPass
      .map((stop) => encodeURIComponent(stop))
      .join(isAppleMaps ? '+to:' : '/');
    const baseURL = isAppleMaps
      ? 'http://maps.apple.com'
      : 'https://www.google.com/maps/dir/';
    const link = isAppleMaps
      ? `${baseURL}?saddr=${encodedOrigin}&daddr=${encodedStops}`
      : `${baseURL}${encodedOrigin}/${encodedStops}`;

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      // Mobile device: set window.location.href
      window.location.href = link;
    } else {
      // Computer: open link in a new tab
      window.open(link, '_blank');
    }

    setItems((prevItems) => prevItems.slice(isAppleMaps ? 14 : 10));
  };

  const handleManualAddressSubmit = () => {
    setItems((prevItems) => [...prevItems, manualAddress]);
    setManualAddress('');
  };

  if (isLoading) {
    return (
      <Dimmer active>
        <Loader>
          Processing... {progress}/{total}
        </Loader>
      </Dimmer>
    );
  }

  return (
    <div
      style={{
        paddingTop: '50px',
        display: 'flex',
        alignContent: 'center',
        flexDirection: 'column',
        marginRight: '10%',
        marginLeft: '10%',
      }}
    >
      <Header style={{ marginLeft: 'auto', marginRight: 'auto' }} as="h1">
        flex-2-map
      </Header>
      <Label style={{ marginTop: '30px' }} standard>
        State Delivering In:
      </Label>
      <Dropdown
        placeholder="Select State"
        search
        selection
        options={stateOptions}
        value={state}
        onChange={(e, { value }) => setState(value)}
        style={{ marginTop: '15px' }}
      />

      <Label style={{ marginTop: '30px' }} standard content="Preferred Map:" />
      <div
        className="maps-provider"
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          marginTop: '15px',
        }}
      >
        <div
          className="radio-group"
          style={{ marginRight: '10px', position: 'relative' }}
        >
          <Form.Radio
            id="apple-maps"
            name="maps-provider"
            checked={isAppleMaps}
            onChange={() => setIsAppleMaps(true)}
            style={{ display: 'none' }}
          />
          <label htmlFor="apple-maps" style={{ cursor: 'pointer' }}>
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/1/17/AppleMaps_logo.svg"
              alt="Apple Maps"
              style={{
                width: '64px',
                height: '64px',
                border: isAppleMaps ? '5px solid green' : 'none',
                borderRadius: '15px',
                padding: '3px',
              }}
            />
          </label>
        </div>
        <div
          className="radio-group"
          style={{ marginLeft: '10px', position: 'relative' }}
        >
          <Form.Radio
            id="google-maps"
            name="maps-provider"
            checked={!isAppleMaps}
            onChange={() => setIsAppleMaps(false)}
            style={{ display: 'none' }}
          />
          <label htmlFor="google-maps" style={{ cursor: 'pointer' }}>
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Google_Maps_Logo_2020.svg"
              alt="Google Maps"
              style={{
                width: '64px',
                height: '64px',
                border: !isAppleMaps ? '5px solid green' : 'none',
                borderRadius: '10px',
                padding: '3px',
              }}
            />
          </label>
        </div>
      </div>

      <Label
        color="grey"
        style={{
          marginTop: '25px',
          textAlign: 'center',
          width: '40%',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {`Selected ${total} Image(s)`}
      </Label>
      <Button
        color="green"
        content="Add Images"
        labelPosition="left"
        icon="file image"
        size="huge"
        onClick={() => fileInputRef.current.click()}
        style={{ marginTop: '10px' }}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleInputChange}
      />
      <Button
        color="teal"
        size="huge"
        icon="searchengin"
        content="Extract Addresses"
        labelPosition="left"
        onClick={performOCR}
        disabled={images.length === 0 || isLoading}
        style={{ marginTop: '30px' }}
      />

      {items.length > 0 && (
        <Card.Group centered stackable style={{ marginTop: '30px' }}>
          {items.map((item, index) => (
            <Card
              key={index}
              fluid
              draggable={editIndex !== index} // Disable dragging when item is being edited
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <Card.Content>
                {editIndex === index ? (
                  <div>
                    <Input
                      style={{ width: '100%' }}
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                    />
                    <div
                      className="ui two buttons"
                      style={{ marginTop: '15px' }}
                    >
                      <Button
                        color="yellow"
                        onClick={() => saveEdit(index)}
                        style={{
                          paddingRight: '29.5px',
                          paddingLeft: '29.5px',
                        }}
                      >
                        Save
                      </Button>
                      <Button standard onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>{item}</div>
                    <div
                      className="ui two buttons"
                      style={{ marginTop: '15px' }}
                    >
                      <Button
                        color="blue"
                        onClick={() => startEdit(index, item)}
                        style={{
                          paddingRight: '29.5px',
                          paddingLeft: '29.5px',
                        }}
                      >
                        Edit
                      </Button>
                      <Button color="red" onClick={() => deleteItem(index)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card>
          ))}
        </Card.Group>
      )}

      <div style={{ display: 'flex', marginTop: '30px' }}>
        <Input
          style={{ width: '100%' }}
          type="text"
          placeholder="Manually add address"
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
        />
        <Button
          color="green"
          content="Add"
          size="huge"
          onClick={handleManualAddressSubmit}
          style={{ marginLeft: '10px' }}
          disabled={!manualAddress || manualAddress === ''}
        />
      </div>
      <Button
        color="black"
        size="huge"
        content="Get Driving Directions"
        labelPosition="left"
        icon="car"
        onClick={generateDrivingDirectionLink}
        disabled={items.length === 0}
        style={{ marginTop: '30px', marginBottom: '30px' }}
      />
    </div>
  );
}

export default App;
