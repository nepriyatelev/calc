package main

import (
	"os"
	"os/signal"
	"time"

	"github.com/nepriyatelev/calc/Agent/intenal/config"
	"github.com/nepriyatelev/calc/Agent/intenal/http/client"
)

func main() {
	config := config.New()
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt)
	go client.Ping(config)
	for i := 0; i < config.MaxGoroutines; i++ {
		go func(id int) {
			for {
				client, err := client.New(config, id)
				if err != nil {
					break
				}
				if err := client.Start(); err != nil {
					time.Sleep(1 * time.Second)
				}
			}
		}(i)
	}

	<-done
}
