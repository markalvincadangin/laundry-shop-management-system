# Quickstart: Audit Validation

## Testing the "Coming Soon" UX

1. Start the frontend: `npm run dev`
2. Look at the sidebar. The "Messaging" link should have a visible badge indicating it is not yet available.
3. Click the "Messaging" link. You should be prevented from viewing the feature or presented with a "Coming Soon" placeholder.

## Running the Business Rules Audit

1. Go to the backend directory.
2. Run the test suite:
   ```bash
   make test-backend
   ```
3. Ensure all tests in `OrderServiceTest` pass, specifically those testing weight limits, extra minutes, and add-ons.
