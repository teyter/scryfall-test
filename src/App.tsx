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

  useEffect(() => {
    axios
      .get(`https://api.scryfall.com/cards/search?order=set&q=set:ltr`)
      .then((response) => {
        // console.log(response.data);
        setCardsData(response.data.data);
        DATA = response.data.data;
        response.data.data.map((card) => {
          /**
          DATA.push({
            name: card.name,
            image: card.image_uris.small,
            colors: card.colors,
            type: card.type_line,
          });
           */
        });

        console.log("data", DATA);
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
    setSelectedType(type);
    const options = {
      threshold: 0.4,
      keys: ["type_line"],
    };
    const fuse = new Fuse(DATA, options);
    const results = fuse.search(type.value);

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
        options={options}
        value={selectedType}
        onChange={handleType}
      />
    );
  };

  const CardList = () => {
    return (
      <Flex flexWrap="wrap" justify="space-around">
        {cardsData.map((card) => (
          <Card maxW="sm">
            <CardBody>
              <Image src={card.image_uris.small} borderRadius="sm" />
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
