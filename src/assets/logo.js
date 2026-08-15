// Single source of truth for the brand mark.
//
// mohor-logo.png is the official artwork, trimmed to its bounding box from
// "Mohor Logo & Post.png" and resized for the web. It has a transparent
// background and carries its own मोहोर / MEDIA. lettering.
//
// To swap it: drop the new file in this folder, change the import below (an
// .svg works as an import too), and set `logoIsSquare` to match:
//   true  — square artwork that should be circle-cropped (object-fit: cover)
//   false — artwork with its own silhouette or transparency, shown uncropped
//           at its natural aspect ratio, with no circular mask or white ring
import logo from './mohor-logo.png';

export const logoIsSquare = false;

export default logo;
