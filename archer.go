package main

import (
	"fmt"
	"os"

	"github.com/urfave/cli"
)

func main() {
	app := cli.NewApp()
	app.Name = "archer"
	app.Usage = "Shoot all the vulns!"
	app.Action = func(c *cli.Context) error {
		fmt.Println("hello world!")
		return nil
	}
	app.Run(os.Args)
}
