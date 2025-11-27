import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { usePointsStore } from "../../stores/pointsStore";
import { useAuthStore } from "../../stores/authStore";
import { COLORS } from "../../utils/constants";
import { styles } from "./styles";
import { Point } from "../../types/api";
import ImageGallery from "../../components/ImageGallery";
import { mediaStorageService } from "../../services/storage";
import { apiService } from "../../services/api";
import { buildPointGallerySources } from "../../utils/pointMedia";

const techniques = [
  "Agulha fina",
  "Eletroacupuntura",
  "Moxabustão",
  "Ventosa",
  "Auriculoterapia",
  "Acupressão",
];

export default function PointDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    points,
    favorites,
    selectedPoint,
    loadPoint,
    toggleFavorite,
    loading,
  } = usePointsStore((state) => ({
    points: state.points,
    favorites: state.favorites,
    selectedPoint: state.selectedPoint,
    loadPoint: state.loadPoint,
    toggleFavorite: state.toggleFavorite,
    loading: state.loading,
  }));
  const { user } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>(
    {}
  );

  const pointId = useMemo(() => (Array.isArray(id) ? id[0] : id) ?? "", [id]);

  useEffect(() => {
    let isMounted = true;

    const fetchPoint = async () => {
      if (!pointId) {
        setLocalLoading(false);
        return;
      }

      setLocalLoading(true);

      try {
        await loadPoint(pointId);
      } catch (error) {
        console.warn("Falha ao carregar ponto", error);
      } finally {
        if (isMounted) {
          setLocalLoading(false);
        }
      }
    };

    fetchPoint();

    return () => {
      isMounted = false;
    };
  }, [pointId, loadPoint]);

  const resolvedPoint: (Point & { function?: string }) | null = useMemo(() => {
    if (selectedPoint && selectedPoint.id === pointId) {
      return selectedPoint as Point & { function?: string };
    }

    return (
      points.find((p) => p.id === pointId) ||
      favorites.find((p) => p.id === pointId) ||
      null
    );
  }, [favorites, pointId, points, selectedPoint]);

  const gallerySources = useMemo(
    () =>
      resolvedPoint
        ? resolvedPoint.gallerySources ??
          buildPointGallerySources(resolvedPoint)
        : [],
    [resolvedPoint]
  );

  const handleToggleFavorite = async () => {
    if (!resolvedPoint) return;

    try {
      await toggleFavorite(resolvedPoint.id);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível alterar favorito");
    }
  };

  const isFavorite = favorites.some((p) => p.id === resolvedPoint?.id);
  const indicationsList = useMemo(() => {
    if (!resolvedPoint?.indications) {
      return [] as string[];
    }

    if (Array.isArray(resolvedPoint.indications)) {
      return resolvedPoint.indications;
    }

    return resolvedPoint.indications
      .split(/\n|;|•|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [resolvedPoint?.indications]);

  const isAdmin = useMemo(() => {
    const role = user?.role?.toString().toUpperCase();
    return role === "ADMIN";
  }, [user?.role]);

  const refreshPoint = useCallback(async () => {
    if (!pointId) {
      return;
    }
    try {
      await loadPoint(pointId);
    } catch (error) {
      console.warn("Falha ao atualizar ponto", error);
    }
  }, [loadPoint, pointId]);

  const handleAddImagesFromLibrary = useCallback(async () => {
    if (!resolvedPoint) return;

    try {
      const assets = await mediaStorageService.pickImage(true);
      if (assets.length === 0) {
        return;
      }

      setUploading(true);
      const urls = await mediaStorageService.uploadMultipleImages(
        assets.map((asset) => asset.uri),
        ({ index, progress }) =>
          setUploadProgress((prev) => ({ ...prev, [index]: progress }))
      );

      await apiService.addImagesToPoint(resolvedPoint.id, urls);
      await refreshPoint();
      Alert.alert("Sucesso", "Imagens adicionadas com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar imagens", error);
      Alert.alert("Erro", "Falha ao adicionar imagens");
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [refreshPoint, resolvedPoint]);

  const handleTakePicture = useCallback(async () => {
    if (!resolvedPoint) return;

    try {
      const asset = await mediaStorageService.takePicture();
      if (!asset) {
        return;
      }

      setUploading(true);
      const url = await mediaStorageService.uploadImage(asset.uri, (progress) =>
        setUploadProgress({ 0: progress })
      );

      await apiService.addImagesToPoint(resolvedPoint.id, [url]);
      await refreshPoint();
      Alert.alert("Sucesso", "Imagem adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao capturar imagem", error);
      Alert.alert("Erro", "Falha ao adicionar imagem da câmera");
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [refreshPoint, resolvedPoint]);

  const handleAddImage = useCallback(() => {
    Alert.alert("Adicionar imagem", "Selecione uma opção", [
      { text: "Cancelar", style: "cancel" },
      { text: "Câmera", onPress: handleTakePicture },
      { text: "Galeria", onPress: handleAddImagesFromLibrary },
    ]);
  }, [handleAddImagesFromLibrary, handleTakePicture]);

  const handleDeleteImage = useCallback(
    (remoteIndex: number) => {
      if (
        !resolvedPoint?.imageUrls ||
        remoteIndex < 0 ||
        remoteIndex >= resolvedPoint.imageUrls.length
      ) {
        return;
      }

      const imageUrl = resolvedPoint.imageUrls[remoteIndex];

      Alert.alert("Remover imagem", "Deseja deletar esta imagem?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.deletePointImage(resolvedPoint.id, imageUrl);
              await apiService.deleteStorageFile(imageUrl);
              await refreshPoint();
              Alert.alert("Sucesso", "Imagem deletada");
            } catch (error) {
              console.error("Erro ao deletar imagem", error);
              Alert.alert("Erro", "Falha ao deletar imagem");
            }
          },
        },
      ]);
    },
    [refreshPoint, resolvedPoint]
  );

  const handleReorderImages = useCallback(
    async (fromRemoteIndex: number, toRemoteIndex: number) => {
      if (
        !resolvedPoint?.imageUrls ||
        fromRemoteIndex === toRemoteIndex ||
        fromRemoteIndex < 0 ||
        toRemoteIndex < 0 ||
        fromRemoteIndex >= resolvedPoint.imageUrls.length ||
        toRemoteIndex >= resolvedPoint.imageUrls.length
      ) {
        return;
      }

      const nextOrder = [...resolvedPoint.imageUrls];
      const [moved] = nextOrder.splice(fromRemoteIndex, 1);
      nextOrder.splice(toRemoteIndex, 0, moved);

      try {
        await apiService.reorderPointImages(resolvedPoint.id, nextOrder);
        await refreshPoint();
      } catch (error) {
        console.error("Erro ao reordenar imagens", error);
        Alert.alert("Erro", "Falha ao reordenar imagens");
      }
    },
    [refreshPoint, resolvedPoint]
  );

  if (loading || localLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!resolvedPoint) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Ponto não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
      >
        <ImageGallery
          images={gallerySources}
          editable={isAdmin}
          onAddImage={handleAddImage}
          onDeleteImage={handleDeleteImage}
          onReorder={handleReorderImages}
        />

        {uploading && (
          <View style={styles.uploadInfo}>
            <ActivityIndicator
              color={COLORS.primary}
              style={styles.uploadSpinner}
            />
            <View style={styles.uploadTexts}>
              <Text style={styles.uploadTitle}>Enviando imagens...</Text>
              {Object.entries(uploadProgress).map(([index, progress]) => (
                <Text key={index} style={styles.uploadProgressText}>
                  Imagem {Number(index) + 1}: {progress}%
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.pointName}>{resolvedPoint.name}</Text>
          <Text style={styles.pointCode}>{resolvedPoint.code}</Text>
          <Text style={styles.pointMeridian}>{resolvedPoint.meridian}</Text>

          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
            ]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? COLORS.error : COLORS.text}
            />
            <Text
              style={[
                styles.favoriteButtonText,
                isFavorite && styles.favoriteButtonTextActive,
              ]}
            >
              {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização</Text>
          <View style={styles.card}>
            <Ionicons
              name="location"
              size={24}
              color={COLORS.primary}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Posição Anatômica</Text>
            <Text style={styles.cardContent}>
              {resolvedPoint.location || "Localização não disponível"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicações</Text>
          <View style={styles.indicationsList}>
            {indicationsList.length > 0 ? (
              indicationsList.map((indication, index) => (
                <View key={index} style={styles.indicationItem}>
                  <Ionicons
                    name="medical"
                    size={16}
                    color={COLORS.primary}
                    style={styles.indicationIcon}
                  />
                  <Text style={styles.indicationText}>{indication}</Text>
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardContent}>
                  Indicações não disponíveis para este ponto.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Técnicas Aplicáveis</Text>
          <View style={styles.techniquesGrid}>
            {techniques.map((technique, index) => (
              <View key={index} style={styles.techniqueChip}>
                <Text style={styles.techniqueText}>{technique}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Função</Text>
          <View style={styles.card}>
            <Ionicons
              name="flash"
              size={24}
              color={COLORS.primary}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Ação Terapêutica</Text>
            <Text style={styles.cardContent}>
              {resolvedPoint.function || "Função terapêutica não especificada"}
            </Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Ionicons
            name="warning"
            size={24}
            color={COLORS.error}
            style={styles.warningIcon}
          />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Aviso Importante</Text>
            <Text style={styles.warningText}>
              Este aplicativo é apenas para fins educacionais. Sempre consulte
              um profissional qualificado antes de aplicar qualquer técnica de
              acupuntura.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
