;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u100))
(define-constant err-unauthorized (err u101))
(define-constant err-already-claimed (err u102))
(define-constant err-invalid-rating (err u103))

;; Data structures
(define-map locations 
  uint 
  {
    name: (string-ascii 100),
    description: (string-ascii 500),
    latitude: uint,
    longitude: uint,
    category: (string-ascii 20),
    owner: (optional principal),
    rating: uint,
    review-count: uint
  }
)

(define-map reviews 
  { location-id: uint, reviewer: principal }
  {
    rating: uint,
    comment: (string-ascii 500),
    timestamp: uint
  }
)

(define-data-var next-location-id uint u1)

;; Public functions
(define-public (add-location (name (string-ascii 100)) 
                           (description (string-ascii 500))
                           (latitude uint)
                           (longitude uint)
                           (category (string-ascii 20)))
  (let ((location-id (var-get next-location-id)))
    (map-set locations location-id
      {
        name: name,
        description: description,
        latitude: latitude,
        longitude: longitude,
        category: category,
        owner: none,
        rating: u0,
        review-count: u0
      }
    )
    (var-set next-location-id (+ location-id u1))
    (ok location-id)
  )
)

(define-public (add-review (location-id uint) 
                          (rating uint)
                          (comment (string-ascii 500)))
  (let ((location (unwrap! (map-get? locations location-id) err-not-found)))
    (asserts! (and (>= rating u1) (<= rating u5)) err-invalid-rating)
    (map-set reviews 
      { location-id: location-id, reviewer: tx-sender }
      {
        rating: rating,
        comment: comment,
        timestamp: block-height
      }
    )
    (map-set locations location-id
      (merge location 
        {
          rating: (/ (+ (* location rating) rating) (+ location review-count u1)),
          review-count: (+ location review-count u1)
        }
      )
    )
    (ok true)
  )
)

(define-public (claim-location (location-id uint))
  (let ((location (unwrap! (map-get? locations location-id) err-not-found)))
    (asserts! (is-none (get owner location)) err-already-claimed)
    (map-set locations location-id
      (merge location { owner: (some tx-sender) })
    )
    (ok true)
  )
)

;; Read only functions
(define-read-only (get-location (location-id uint))
  (ok (map-get? locations location-id))
)

(define-read-only (get-location-reviews (location-id uint))
  (ok (map-get? reviews { location-id: location-id, reviewer: tx-sender }))
)
