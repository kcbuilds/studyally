package com.studybuddy.repository;

import com.studybuddy.entity.PartnerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PartnerRequestRepository extends JpaRepository<PartnerRequest, Long> {

    Optional<PartnerRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);

    List<PartnerRequest> findByReceiverIdAndStatus(Long receiverId, PartnerRequest.Status status);

    List<PartnerRequest> findBySenderIdAndStatus(Long senderId, PartnerRequest.Status status);

    @Query("SELECT pr FROM PartnerRequest pr WHERE " +
           "(pr.sender.id = :userId OR pr.receiver.id = :userId) AND pr.status = 'ACCEPTED'")
    List<PartnerRequest> findAcceptedPartnersByUserId(@Param("userId") Long userId);

    boolean existsBySenderIdAndReceiverId(Long senderId, Long receiverId);
}
