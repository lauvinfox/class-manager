import React, { useMemo } from "react";

const allowedColors = [
  "3E39AA",
  "CC8236",
  "C13F2D",
  "379CAF",
  "2F8E5C",
  "D9AC4D",
];

function pickColor(name: string) {
  // Pilih warna berdasarkan hash nama agar konsisten
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % allowedColors.length;
  return allowedColors[idx];
}

interface ProfilePicProps {
  firstName?: string;
  lastName?: string;
  size?: number;
  random?: boolean;
}

export const ProfilePic = React.memo(
  ({ firstName, lastName, size = 40, random = false }: ProfilePicProps) => {
    const name = `${firstName} ${lastName}`;
    // Memoize the avatar URL so it doesn't change on every render
    const avatarUrl = useMemo(() => {
      let bg = "4D46D3";
      if (random && firstName) {
        bg = pickColor(name);
      }
      return `https://ui-avatars.com/api/?name=${firstName || ""}+${
        lastName || ""
      }&background=${bg}&color=fff`;
    }, [firstName, lastName, random, name]);

    return (
      <div
        className="grid shrink-0 place-content-center rounded-md bg-indigo-600"
        style={{ width: size, height: size }}
      >
        <img
          src={avatarUrl}
          alt=""
          className="rounded-md"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }
);
