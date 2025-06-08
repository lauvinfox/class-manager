import React, { useMemo } from "react";
import { ProfilePicProps } from "./Sidebar";

export const ProfilePic = React.memo(
  ({ firstName, lastName }: ProfilePicProps) => {
    // Memoize the avatar URL so it doesn't change on every render
    const avatarUrl = useMemo(() => {
      return `https://ui-avatars.com/api/?name=${firstName || ""}+${
        lastName || ""
      }&background=4D46D3&color=fff&`;
    }, [firstName, lastName]);
    return (
      <div className="grid size-10 shrink-0 place-content-center rounded-md bg-indigo-600">
        <img src={avatarUrl} alt="" className="w-10 h-10 rounded-md" />
      </div>
    );
  }
);
