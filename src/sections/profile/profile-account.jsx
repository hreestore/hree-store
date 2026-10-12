import { ProfileGeneral } from "./profile-general";
import { ProfileSecurity } from "./profile-security";

export function ProfileAccount() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <ProfileGeneral />
      </div>

      <div>
        <ProfileSecurity />
      </div>
    </div>
  );
}
