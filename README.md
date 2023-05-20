# flex-2-map

Utilizing OCR technology, the system extracts addresses from screenshots
captured within the Amazon Flex app. It then generates a multi-stop driving
direction link that seamlessly integrates with both Apple Maps and the Google
Maps.

## Usage

1. Select the state for delivering the items.

2. Choose the preferred map provider (Apple Maps or Google Maps).

3. Add images by clicking the "Add Images" button and selecting the desired image files.

4. Click the "Extract Addresses" button to start the OCR process. The application will extract addresses from the images using Tesseract.js and display a progress indicator.

5. Once the addresses are extracted, they will be displayed as cards. You can edit, delete, and rearrange the addresses using the provided functionalities.

6. Manually add addresses by entering them in the input field and clicking the "Add" button.

7. Click the "Get Driving Directions" button to generate driving directions based on the extracted addresses. The directions will open in a new tab or redirect the user to the maps application on mobile devices.

## License

This project is licensed under the GNU Affero General Public License (AGPL). See
the LICENSE file for more details.
