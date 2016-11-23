package main

import (
	"fmt"
	"github.com/docker/spdystream"
	"net"
	"net/http"
)

func main() {
	conn, err := net.Dial("tcp", "localhost:9090")
	if err != nil {
		panic(err)
	}
	spdyConn, err := spdystream.NewConnection(conn, false)
	if err != nil {
		panic(err)
	}

	header := http.Header{}
	// Although spdystream doesn't mind about :method and :path headers, these
	// are necessary for interop with spdy-transport
	header.Add(":method", "GET")
	header.Add(":path", "/")

	go spdyConn.Serve(spdystream.NoOpStreamHandler)

	stream, err := spdyConn.CreateStream(header, nil, false)
	if err != nil {
		panic(err)
	}

	stream.Wait()

	fmt.Fprint(stream, "Hey, how is it going! (go client asking)")

	buf := make([]byte, 35)
	stream.Read(buf)
	fmt.Println(string(buf))

	stream.Close()
}
