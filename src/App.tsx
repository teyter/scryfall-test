import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import {
  Card,
  CardBody,
  Image,
  Input,
} from "@chakra-ui/react";
import Fuse from "fuse.js";

let DATA = [];

function App() {
  const [cardsData, setCardsData] = useState([]);

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
      }
      else {
        const fuseToTableData = [];
        results.map((x) => fuseToTableData.push(x.item));
        setCardsData(fuseToTableData);
      }
  }

  return (
    <ChakraProvider>
      <Box margin="0px auto" w="80vw" h="85vh">
        <Box margin="20px">
          <Input placeholder="Search" onChange={(e) => handleSearch(e.target.value)} />
        </Box>
        <CardList />
      </Box>
    </ChakraProvider>
  );
}

export default App;
