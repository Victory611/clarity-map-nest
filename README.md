# MapNest
A decentralized navigation app focused on hidden gems and local experiences in cities.

## Features
- Add new locations with details (name, description, coordinates, category)
- Review and rate locations
- Claim ownership of locations
- Reward system for contributing quality content
- Discovery mechanism for hidden gems

## Setup and Installation
1. Clone the repository
2. Install Clarinet (if not already installed)
3. Run `clarinet check` to verify the contract
4. Run `clarinet test` to run the test suite

## Usage Examples
```clarity
;; Add a new location
(contract-call? .map-nest add-location "Secret Garden Cafe" 
  "Hidden courtyard cafe with amazing pastries"
  u40712365 u-73891245 
  "cafe")

;; Add a review
(contract-call? .map-nest add-review u1 u5 
  "Great hidden spot with authentic atmosphere!")

;; Claim location ownership
(contract-call? .map-nest claim-location u1)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
