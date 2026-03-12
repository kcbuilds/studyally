package com.studybuddy.repository;

import com.studybuddy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.id != :currentUserId AND u.city = :city")
    List<User> findByCity(@Param("currentUserId") Long currentUserId, @Param("city") String city);

    @Query("SELECT u FROM User u WHERE u.id != :currentUserId")
    List<User> findAllExcept(@Param("currentUserId") Long currentUserId);

    @Query("SELECT u FROM User u WHERE u.id != :currentUserId AND u.city = :city AND (u.latitude IS NULL OR u.longitude IS NULL)")
    List<User> findByCityAndNullCoords(@Param("currentUserId") Long currentUserId, @Param("city") String city);

    // All users with no GPS coords — can't be found by haversine query
    @Query("SELECT u FROM User u WHERE u.id != :currentUserId AND (u.latitude IS NULL OR u.longitude IS NULL)")
    List<User> findAllWithNullCoords(@Param("currentUserId") Long currentUserId);

    @Query(value = """
    SELECT *, (
      6371 * acos(
        cos(radians(:lat)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(:lng)) +
        sin(radians(:lat)) * sin(radians(latitude))
      )
    ) AS distance
    FROM users
    WHERE id != :userId
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
    HAVING distance <= :radiusKm
    ORDER BY distance ASC
    """, nativeQuery = true)
    List<User> findNearbyUsers(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("userId") Long userId,
            @Param("radiusKm") double radiusKm
    );
}
