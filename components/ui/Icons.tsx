import Ionicons from "@expo/vector-icons/Ionicons"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import Entypo from "@expo/vector-icons/Entypo"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import AntDesign from "@expo/vector-icons/AntDesign"
import Octicons from "@expo/vector-icons/Octicons"
import Feather from "@expo/vector-icons/Feather"
import { Theme } from "@/libs/consts"

export const RestartIcon = (props: any) => (
  <MaterialCommunityIcons
    name="restart"
    color={Theme.colors.text}
    size={24}
    {...props}
  />
)

export const CheckIcon = (props: any) => (
  <MaterialCommunityIcons
    name="check-decagram-outline"
    color={Theme.colors.text}
    size={24}
    {...props}
  />
)

export const CloseIcon = (props: any) => (
  <Ionicons name="close" color={Theme.colors.text} size={24} {...props} />
)

export const LanguageIcon = (props: any) => (
  <Ionicons name="language" color={Theme.colors.text} size={24} {...props} />
)

export const PlayIcon = (props: any) => (
  <Ionicons
    name="play-outline"
    color={Theme.colors.text}
    size={24}
    {...props}
  />
)

export const UsersIcon = (props: any) => (
  <Feather name="users" color={Theme.colors.text} size={24} {...props} />
)

export const LinkIcon = (props: any) => (
  <Octicons name="link" color={Theme.colors.text} size={24} {...props} />
)

export const OfflineIcon = (props: any) => (
  <Octicons
    name="cloud-offline"
    color={Theme.colors.text}
    size={24}
    {...props}
  />
)

export const GameIcon = (props: any) => (
  <FontAwesome5 name="gamepad" color={Theme.colors.text} size={24} {...props} />
)

export const OnlineIcon = (props: any) => (
  <Octicons name="cloud" color={Theme.colors.text} size={24} {...props} />
)

export const BackIcon = (props: any) => (
  <Entypo name="chevron-left" color={Theme.colors.text} size={24} {...props} />
)

export const ForwardIcon = (props: any) => (
  <Entypo name="chevron-right" color={Theme.colors.text} size={24} {...props} />
)

export const CogIcon = (props: any) => (
  <FontAwesome name="cog" size={24} color={Theme.colors.text} {...props} />
)

export const InfoIcon = (props: any) => (
  <FontAwesome
    name="info-circle"
    size={24}
    color={Theme.colors.text}
    {...props}
  />
)

export const HomeIcon = (props: any) => (
  <FontAwesome5 name="home" size={24} color={Theme.colors.text} {...props} />
)

export const StatsIcon = (props: any) => (
  <Ionicons name="stats-chart" size={24} color={Theme.colors.text} {...props} />
)

export const VibrationIcon = (props: any) => (
  <MaterialIcons
    name="vibration"
    size={24}
    color={Theme.colors.text}
    {...props}
  />
)

export const PrivacyIcon = (props: any) => (
  <MaterialCommunityIcons
    name="security"
    size={24}
    color={Theme.colors.text}
    {...props}
  />
)

export const WebIcon = (props: any) => (
  <MaterialCommunityIcons
    name="web"
    size={24}
    color={Theme.colors.text}
    {...props}
  />
)

export const LogoutIcon = (props: any) => (
  <MaterialCommunityIcons
    name="account-arrow-left"
    size={24}
    color={Theme.colors.text}
    {...props}
  />
)

export const ListIcon = (props: any) => (
  <MaterialCommunityIcons
    name="format-list-bulleted"
    size={24}
    color={Theme.colors.text}
    {...props}
  />
)

export const SoundIcon = (props: any) => (
  <AntDesign name="sound" size={24} color={Theme.colors.text} {...props} />
)
