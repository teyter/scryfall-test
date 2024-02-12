import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Box, Button, ChakraProvider, Flex } from "@chakra-ui/react";
import { Card, CardBody, Image, Input } from "@chakra-ui/react";
import Fuse from "fuse.js";
import Select from "react-select";

let DATA = [];

function App() {
  const [cardsData, setCardsData] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [count, setCount] = useState(0);

  const [formInputState, setFormInputState] = useState({});

  const handleInputChange = (fieldName, value) => {
    setFormInputState((prevState) => {
      if (value === null) {
        // If value is null, remove the key from the state
        const { [fieldName]: removedField, ...newState } = prevState as {
          [key: string]: any;
        };
        return newState;
      } else {
        // If value is not null, update the state as usual
        return {
          ...prevState,
          [fieldName]: value,
        };
      }
    });
  };

  useEffect(() => {
    setCount(cardsData.length);
  }, [cardsData]);
  useEffect(() => {
    axios
      .get(`https://api.scryfall.com/cards/search?order=set&q=set:ltr`)
      .then((response) => {
        response.data.data.map((card) => {
          let color = "";
          if (card.colors.length === 1) {
            switch (card.colors[0]) {
              case "W":
                color = "white";
                break;
              case "U":
                color = "blue";
                break;
              case "R":
                color = "red";
                break;
              case "B":
                color = "black";
                break;
              case "G":
                color = "green";
                break;
            }
          } else if (card.colors.length === 0) {
            color = "Colorless";
          } else if (card.colors.length > 1) {
            color = "Multicolor";
          }
          DATA.push({
            name: card.name,
            image: card.image_uris.small,
            colors: color,
            type_line: card.type_line,
          });
        });
        // DATA = response.data.data;
        setCardsData(DATA);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const TypeSelect = () => {
    const options = [
      { value: "creature", label: "Creature" },
      { value: "enchantment", label: "Enchantment" },
      { value: "artifact", label: "Artifact" },
      { value: "instant", label: "Instant" },
      { value: "sorcery", label: "Sorcery" },
      { value: "land", label: "Land" },
    ];
    return (
      <Select
        placeholder="Type"
        isClearable
        options={options}
        value={selectedType}
        onChange={(c) => {
          setSelectedType(c);
          handleInputChange("type_line", c ? `'${c.value}` : null);
        }}
      />
    );
  };

  const ColorSelect = () => {
    const options = [
      { value: "white", label: "White" },
      { value: "blue", label: "Blue" },
      { value: "red", label: "Red" },
      { value: "black", label: "Black" },
      { value: "green", label: "Green" },
      { value: "multicolor", label: "Multicolor" },
      { value: "colorless", label: "Colorless" },
    ];
    return (
      <Select
        placeholder="Color"
        isClearable
        options={options}
        value={selectedColor}
        onChange={(c) => {
          setSelectedColor(c);
          handleInputChange("colors", c ? `=${c.value}` : null);
        }}
      />
    );
  };

  const onSearch = () => {
    if (Object.keys(formInputState).length === 0) {
      setCardsData(DATA);
      return;
    }
    let searchArray = [];
    for (let key in formInputState) {
      searchArray.push({ [key]: formInputState[key] });
    }

    console.log(searchArray);

    const options = {
      threshold: 0.4,
      useExtendedSearch: true,
      keys: ["type_line", "colors"],
    };
    const fuse = new Fuse(DATA, options);
    const results = fuse.search({
      $and: searchArray,
    });
    const fuseToTableData = [];
    results.map((x) => fuseToTableData.push(x.item));
    console.log("handleColor results", results);
    setCardsData(fuseToTableData);
  };

  const CardList = () => {
    return (
      <Flex flexWrap="wrap" justify="space-around">
        {cardsData.map((card) => (
          <Card maxW="sm">
            <CardBody>
              <Image src={card.image} borderRadius="sm" />
            </CardBody>
          </Card>
        ))}
      </Flex>
    );
  };

  return (
    <ChakraProvider>
      <Box margin="0px auto" w="80vw" h="7.5vh">
        <Flex
          mt="1.75rem"
          mb="1rem"
          alignItems="baseline"
          justify={"space-evenly"}
        >
          {/**
          <Input
            placeholder="Search"
            onChange={(e) => handleSearch(e.target.value)}
            width={["80vw", "40vw"]}
          />
           */}

          <Box width={"10vw"}>{count}</Box>
          <Box width={"10vw"}>
            <ColorSelect />
          </Box>
          <Box width={"10vw"}>
            <TypeSelect />
          </Box>
          <Button onClick={onSearch}>Search</Button>
        </Flex>
      </Box>
      <Box margin="0px auto" w="80vw" h="85vh">
        <CardList />
      </Box>
    </ChakraProvider>
  );
}

export default App;
