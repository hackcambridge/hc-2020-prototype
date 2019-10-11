terraform {
  backend "remote" {
    organization = "HackCambridge"

    workspaces {
      name = "hc2020-prototype"
    }
  }
}
