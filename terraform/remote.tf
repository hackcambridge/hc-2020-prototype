terraform {
  backend "remote" {
    organization = "HackCambridge"

    workspaces {
      name = "hackaestus"
    }
  }
}
