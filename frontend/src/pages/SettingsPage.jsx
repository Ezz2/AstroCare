<<<<<<< HEAD
import { useHealthData } from "../health/useHealthData";
import LoadingScreen from "../components/ui/LoadingScreen";
import { PRIMARY_BUTTON_CLASS } from "../components/ui/fieldStyles";
import ProfileForm from "../components/settings/ProfileForm";
// import NotificationToggles from '../components/settings/NotificationToggles'
import PasswordForm from "../components/settings/PasswordForm";
import DataControls from "../components/settings/DataControls";
import MeasurementReference from "../components/settings/MeasurementReference";
import SettingsSection from "../components/settings/SettingsSection";
=======
import { useHealthData } from '../health/useHealthData'
import LoadingScreen from '../components/ui/LoadingScreen'
import { PRIMARY_BUTTON_CLASS } from '../components/ui/fieldStyles'
import ProfileForm from '../components/settings/ProfileForm'
import PasswordForm from '../components/settings/PasswordForm'
import DataControls from '../components/settings/DataControls'
import MeasurementReference from '../components/settings/MeasurementReference'
import SettingsSection from '../components/settings/SettingsSection'
>>>>>>> c989c409ab5cfef637c0c8a03ea7302bb3598848

export default function SettingsPage() {
  const { status, reload } = useHealthData();

  if (status === "loading") return <LoadingScreen />;
  if (status === "error") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-rose-400/30 bg-rose-400/5 p-6">
        <p className="text-sm text-ink-100">
          We could not load your settings. Check your connection and try again.
        </p>
        <button type="button" onClick={reload} className={PRIMARY_BUTTON_CLASS}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ProfileForm />
<<<<<<< HEAD
      {/* <NotificationToggles /> */}
=======
>>>>>>> c989c409ab5cfef637c0c8a03ea7302bb3598848
      <PasswordForm />
      <MeasurementReference />
      <DataControls />
    </div>
  );
}
