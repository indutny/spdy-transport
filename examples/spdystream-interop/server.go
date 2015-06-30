package main

import (
	"github.com/docker/spdystream"
	"net"
)

func main() {
	listener, err := net.Listen("tcp", "localhost:9090")
	if err != nil {
		panic(err)
	}

	for {
		conn, err := listener.Accept()
		if err != nil {
			panic(err)
		}
		spdyConn, err := spdystream.NewConnection(conn, true)
		if err != nil {
			panic(err)
		}
		// This is an "echo server" example, known in the go world as "mirror"
		go spdyConn.Serve(spdystream.MirrorStreamHandler)
	}
}
