"use client";
import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  Container,
  Box,
  Typography,
  Button,
  Drawer,
  IconButton,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db, auth, app } from "../firebase";
import { signOut } from "firebase/auth";
import { Istok_Web, Galada } from "next/font/google";
//const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
import { getVertexAI, getGenerativeModel } from "firebase/vertexai-preview";
// Initialize the Vertex AI service
const vertexAI = getVertexAI(app);
// Initialize the generative model with a model that supports your use case
// Gemini 1.5 models are versatile and can be used with all API capabilities
const model = getGenerativeModel(vertexAI, { model: "gemini-2.0-flash-001" });
const istok_web = Istok_Web({ weight: ["400", "700"], subsets: ["latin"] });
const galada = Galada({ weight: "400", subsets: ["latin"] });
const theme = createTheme({
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          p: 50,
          m: 0,
          fontWeight: "bold",
          width: "100vw",
        },
      },
    },
    MuiTypography: {
      fontFamily: `${istok_web.style.fontFamily}, sans-serif`,
      lineHeight: "2em",
      fontSize: "20px",
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: "none",
          color: "#000",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
          fontFamily: `${istok_web.style.fontFamily}, sans-serif`,
          borderRadius: "15px",
          boxShadow: "none",
          ":hover": {
            backgroundColor: "#fff",
            boxShadow: "none",
          },
        },
      },
    },
  },
});
export default function Pantry() {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = sessionStorage.getItem("uid");
      setUid(uid);
    }
  }, []);
  //console.log(uid);
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipe, setRecipe] = useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchAndLogInventory = async () => {
    const querySnapshot = await getDocs(collection(db, `users/${uid}/pantry`));
    const inventoryList = [];
    querySnapshot.forEach((doc) => {
      inventoryList.push({ id: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    if (uid) {
      fetchAndLogInventory();
    }
  }, [uid]);

  const getRecipe = async () => {
    const ingredients = filteredInventory.map((item) => item.id);
    console.log(ingredients);
    const prompt = `Generate a recipe using these ingredients: ${ingredients.join(
      ", "
    )}. You don't have to use all the ingredients in a single recipe. Don't use more than 3 ingredients from the list. 
Create a balanced and appealing recipe.
      Format the recipe with clear sections for the title, description, ingredients, instructions, and tips. 
      Use Markdown formatting for readability. Here is the structure:

      ## Recipe Title

      Description of the recipe.

      **Ingredients:**

      * **For the Filling:**
          * List of filling ingredients
      * **For the Crumble:**
          * List of crumble ingredients

      **Instructions:**

      1. Step-by-step instructions

      **Tips:**

      * List of tips

      Please follow this structure strictly.
    `;
    // To generate text output, call generateContent with the text input
    const temperature = 0.8;
    const result = await model.generateContent(prompt, { temperature });
    const response = result.response;
    const text = response.text();
    setRecipe(text);
    //console.log(text);
  };

  const handleInventory = () => {
    router.push("../pantry");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      //console.log("User signed out successfully");
      router.push("./");
      // Redirect to login page or perform other actions
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const router = useRouter();
  const drawer = (
    <Box sx={{ minWidth: "300px", backgroundColor: "#F2F8F6", height: "100%" }}>
      <Box
        width="80%"
        margin="auto"
        pt={5}
        display="flex"
        sx={{ flexDirection: "column" }}
      >
        <Box
          flex="1"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Box
            component={"img"}
            sx={{
              width: "65px",
              height: "60px",
            }}
            src="logo.svg"
          />
          <Typography
            sx={{
              fontFamily: `${galada.style.fontFamily}, sans-serif`,
              fontSize: "45px",
              pl: "15px",
            }}
          >
            PanMan
          </Typography>
        </Box>
        <Box mt={4}>
          <Typography sx={{ fontWeight: "700", color: "#676767" }}>
            Pages
          </Typography>
          <Button
            display="flex"
            alignitems="baseline"
            variant="outlined"
            sx={{
              backgroundColor: "#F2F8F6",
              border: "none",
              "&:hover": {
                backgroundColor: "transparent",
                border: "none",
              },
              mt: "15px",
              borderRadius: "15px",
            }}
            onClick={handleInventory}
          >
            <Box
              component={"img"}
              src="edit.svg"
              sx={{ width: "28px" }}
              mr={1}
            />
            <Typography sx={{ color: "#000", fontWeight: "bold" }}>
              Inventory
            </Typography>
          </Button>
          <Button
            display="flex"
            alignitems="baseline"
            variant="outlined"
            bgcolor="transparent"
            border="none"
            sx={{
              minWidth: "100px",
              backgroundColor: "#CCE5B3",
              border: "2px solid #000",
              ":hover": {
                backgroundColor: "#B6CC9F",
                border: "2px solid #000",
              },
              mt: "15px",
              borderRadius: "15px",
            }}
          >
            <Box
              component={"img"}
              src="paper.svg"
              sx={{ width: "28px" }}
              mr={1}
            />
            <Typography sx={{ color: "#000", fontWeight: "bold" }}>
              AI Recipe
            </Typography>
          </Button>
        </Box>
        <Box>
          <Button
            display="flex"
            alignitems="baseline"
            variant="outlined"
            bgcolor="transparent"
            border="none"
            sx={{
              minWidth: "100px",
              border: "none",
              "&:hover": {
                backgroundColor: "transparent",
                border: "none",
              },
              mt: "calc(100vh - 400px)",
              px: "0",
              borderRadius: "15px",
            }}
            onClick={handleLogout}
          >
            <Box
              component={"img"}
              src="logout.svg"
              sx={{ width: "28px" }}
              mr={1}
            />
            <Typography sx={{ color: "#000", fontWeight: "bold" }}>
              Log out
            </Typography>
          </Button>
        </Box>
      </Box>
    </Box>
  );
  const filteredInventory = inventory.filter(
    (item) =>
      item.id &&
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      item.quantity !== null
  );
  console.log(filteredInventory);
  return (
    <ThemeProvider theme={theme}>
      <>
        <link rel="icon" href="logo.svg" />
      </>
      <Container
        disableGutters
        maxWidth={"false"}
        //sx={{ backgroundColor: "red" }}
      >
        <Box
          display="flex"
          flex="1"
          sx={{ flexDirection: { sm: "row", xs: "column" } }}
          justifyContent={"flex-start"}
          minHeight="100vh"
        >
          {isMobile ? (
            <>
              <Box width="90%" margin="auto" mt={2}>
                <IconButton
                  aria-label="open drawer"
                  display="flex"
                  onClick={handleDrawerToggle}
                  sx={{
                    display: { sm: "none" },
                    justifyContent: "flex-start",
                    padding: "0px",
                    flexDirection: "row",
                  }}
                  marginleft="0"
                  marginright="0"
                >
                  <MenuIcon sx={{ fontSize: "50px", color: "#000" }} />
                </IconButton>
              </Box>

              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                  display: { sm: "block", md: "none" },
                  "& .MuiDrawer-paper": { boxSizing: "border-box", flex: 1 },
                }}
              >
                {drawer}
              </Drawer>
            </>
          ) : (
            <Box
              id="sidebar"
              sx={{ height: "100vh", flex: 1, flexShrink: 0, flexGrow: 1 }}
            >
              {drawer}
            </Box>
          )}

          <Box flex="4">
            <Box
              width="90%"
              margin="auto"
              pt="60px"
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: { md: "100vh", xs: "100%" },
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  borderRadius: "20px",
                  border: "3px solid #F2F8F6",
                  marginBottom: 5,
                  height: { xs: "fit-content" },
                  overflow: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: "96%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  margin="auto"
                >
                  <Box
                    sx={{
                      height: {
                        md: recipe === "" ? "0px" : "default",
                        xs: "max-content",
                      },
                      height: "fit-content",
                      width: "90%",
                      //border: "2px solid black",
                      paddingBottom: 5,
                      paddingTop: 2,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    overflow="auto"
                  >
                    <Box sx={{ width: "100%", margin: "auto", paddingY: 3 }}>
                      <Typography>
                        <ReactMarkdown>{recipe}</ReactMarkdown>
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#73B915",
                        "&:hover": {
                          backgroundColor: "#5A8E10", // A darker shade of the background color
                        },
                      }}
                      onClick={getRecipe}
                    >
                      <Typography sx={{ color: "#fff" }}>
                        ✨ Generate Recipe ✨
                      </Typography>
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
