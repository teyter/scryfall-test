import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import { Card, CardBody, Image, Input } from "@chakra-ui/react";
import Fuse from "fuse.js";
import Select from "react-select";

let DATA = [];

function App() {
  const [cardsData, setCardsData] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

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

  const handleSearch = (input) => {
    const options = {
      threshold: 0.6,
      keys: ["name"],
    };
    const fuse = new Fuse(DATA, options);
    const results = fuse.search(input);

    if (!selectedType && !selectedColor) {
      setCardsData(results.map((x) => x.item));
      return;
    }

    if (Object.keys(results).length === 0) {
      if (input) {
        setCardsData([]); // ef leit skilar engu, syna ekkert
      } else {
        setCardsData(DATA); // ef leit er tomt, syna allt
      }
    } else {
      const fuseToTableData = [];
      results.map((x) => fuseToTableData.push(x.item));
      setCardsData(fuseToTableData);
    }
  };

  const handleType = (type) => {
    // console.log("handleType type", type, "color", selectedColor);
    setSelectedType(type);
    const options = {
      threshold: 0.4,
      keys: ["type_line", "colors"],
    };
    const fuse = new Fuse(DATA, options);
    // const results = fuse.search(type.value);
    const results = type
      ? fuse.search({
          $and: [
            { type_line: type.value },
            {
              colors:
                selectedColor && selectedColor.value ? selectedColor.value : "",
            },
          ],
        })
      : fuse.search({
          colors:
            selectedColor && selectedColor.value ? selectedColor.value : "",
        });
    const fuseToTableData = [];
    results.map((x) => fuseToTableData.push(x.item));
    setCardsData(fuseToTableData);
  };

  const handleColor = (color) => {
    // console.log("handleColor color", color, "type", selectedType);
    setSelectedColor(color);
    const options = {
      threshold: 0.4,
      keys: ["colors", "type_line"],
    };
    const fuse = new Fuse(DATA, options);
    // const results = fuse.search(color.value);
    // Check if color is null or undefined and handle accordingly
    let results;
    if (color) {
      console.log("color & type");
      results = fuse.search({
        $and: [
          { colors: color.value },
          {
            type_line:
              selectedType && selectedType.value ? selectedType.value : "",
          },
        ],
      });
    } else {
      console.log("type only");
      results = fuse.search({
        type_line: selectedType && selectedType.value ? selectedType.value : "",
      });
    }

    console.log("handleColor results", results);
    // console.log("results", results);
    const fuseToTableData = [];
    results.map((x) => fuseToTableData.push(x.item));
    setCardsData(fuseToTableData);
  };

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
        onChange={handleType}
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
        onChange={handleColor}
      />
    );
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
          <Input
            placeholder="Search"
            onChange={(e) => handleSearch(e.target.value)}
            width={["80vw", "40vw"]}
          />

          <Box width={"10vw"}>
            <ColorSelect />
          </Box>
          <Box width={"10vw"}>
            <TypeSelect />
          </Box>
        </Flex>
      </Box>
      <Box margin="0px auto" w="80vw" h="85vh">
        <CardList />
      </Box>
    </ChakraProvider>
  );
}

export default App;
