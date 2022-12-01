import {
  Box,
  Button,
  Center,
  chakra,
  Heading,
  Flex,
  Text,
  Textarea,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let sock: Socket;
export default function Index({ username }: { username: string }) {
  const [domLoaded, setDomLoaded] = useState(false);
  const [connection, setConnection] = useState(false);
  const [messages, setMessages] = useState<any>([]);
  const [user, setUser] = useState({
    username,
    inRoom: false,
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setDomLoaded(true);

    sock = io("https://socketio-server.feriirawann.repl.co");

    // Users
    sock.on("user.update", (res) => {
      localStorage.setItem("user", res);
      setUser(res);
    });

    sock.on("connect", () => setConnection(true));

    sock.on("users.update", (res) => setUsers(res));

    // Messages
    sock.on("messages.update", (res) => {
      setMessages(res);

      const messagesContainer = document.getElementById(
        "messagesContainer"
      ) as HTMLDivElement;
      messagesContainer.scroll({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  });

  const join = () => sock.emit("user.join", username);
  const addMessage = (e: any) => {
    e.preventDefault();
    const text = e.target.message.value;
    sock.emit("messages.add", { username, text });
    e.target.message.value = "";
  };

  return (
    <Center alignItems={user.inRoom ? "start" : "center"} pos="fixed" inset={0}>
      {domLoaded && (
        <Box w="md" p="1rem">
          <Box textAlign="center">
            <Text>
              <Heading fontSize="3rem">{users.length}</Heading>
              Orang aktif dalam room
            </Text>{" "}
            {!connection && <Text mt="1rem">Menghubungkan...</Text>}
            {user.inRoom === false && connection === true && (
              <Button onClick={join} m="3rem auto 0">
                Join sebagai: <chakra.strong>{username}</chakra.strong>
              </Button>
            )}
          </Box>

          <Box m="2rem auto 0" display={user.inRoom ? "block" : "none"}>
            <Box id="messagesContainer" overflowY="auto" h="20rem">
              {messages.map((message: any, i: number) => (
                <Flex
                  key={i}
                  justify={message.username === user.username ? "end" : "start"}
                >
                  <Box
                    border=".1rem solid"
                    borderColor="gray.300"
                    p=".2rem .5rem"
                    mb=".5rem"
                    w="90%"
                    borderRadius={
                      message.username === user.username
                        ? ".5rem 0 .5rem .5rem"
                        : "0 .5rem .5rem .5rem"
                    }
                    bg={message.username === user.username ? "teal" : "white"}
                    color={
                      message.username === user.username ? "white" : "black"
                    }
                  >
                    <Text
                      align={
                        message.username === user.username ? "right" : "left"
                      }
                    >
                      {message.username}
                    </Text>
                    {message.text}
                  </Box>
                </Flex>
              ))}
            </Box>

            <chakra.form onSubmit={addMessage}>
              <Textarea id="message" mb="1rem"></Textarea>
              <Flex justify="space-between">
                <Button type="submit">Kirim</Button>
                <Box textAlign="right">
                  {user.username}
                  <Text fontSize=".8rem">
                    Nomor di atas bukanlah nomor telepon yang sebenarnya
                  </Text>
                </Box>
              </Flex>
            </chakra.form>
          </Box>
        </Box>
      )}
    </Center>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      username: `+62${Date.now().toString().slice(0, 10)}`,
    },
  };
}
